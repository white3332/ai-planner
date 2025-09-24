# backend/app/main.py
import os
import bcrypt
import jwt
import httpx
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from urllib.parse import urlencode

class Settings(BaseSettings):
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    KAKAO_CLIENT_ID: str
    # KAKAO_CLIENT_SECRET: str # 카카오는 필수가 아님
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    FRONTEND_URL: str

    class Config:
        env_file = ".env"

# 소셜 로그인 세팅
settings = Settings()
# FastAPI 앱 생성
app = FastAPI()

# CORS 설정 — React 개발 서버(포트 3000) 허용
origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",     # React dev server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 연결
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://root:password@mongodb:27017/")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.mydb

# Pydantic 모델
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# 로그인 엔드포인트
@app.post("/api/login")
async def login_user(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email, "provider": ""})
    if not db_user or not bcrypt.checkpw(user.password.encode(), db_user["hashed_password"].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="이메일 또는 비밀번호가 잘못되었습니다.")
    
    # JWT 발급
    token = create_jwt_token(db_user)
    
    # user 정보에 provider 필드가 없으면 빈 문자열로
    provider = db_user.get("provider", "")
    
    return {
        "message": f"{db_user['name']}님, 환영합니다!",
        "token": token,
        "user": {
            "email": db_user["email"],
            "provider": provider
        }
    }

# 회원가입 엔드포인트
@app.post("/api/signup", status_code=status.HTTP_201_CREATED)
async def signup_user(user: UserCreate):
    # 1) 이미 존재하는지 확인
    existing = await db.users.find_one({"email": user.email, "provider": ""})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다."
        )

    # 2) 비밀번호 해시화
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    # 3) 사용자 문서 삽입 (provider 필드 포함)
    await db.users.insert_one({
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed,
        "provider": ""   # 일반 회원가입 유저는 빈 문자열
    })

    return {"message": "회원가입이 성공적으로 완료되었습니다."}


# JWT 토큰 생성 함수
def create_jwt_token(user_data: dict) -> str:
    payload = {
        "user_id": str(user_data["_id"]),
        "email": user_data["email"],
        "name": user_data["name"],
        "exp": datetime.utcnow() + timedelta(hours=24)  # 24시간 후 만료
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

# 구글 OAuth 시작
@app.get("/auth/google")
async def google_login():
    google_auth_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/auth/google/callback",
        "scope": "openid email profile",
        "response_type": "code",
        "access_type": "offline"
    }
    url = f"{google_auth_url}?{urlencode(params)}"
    return RedirectResponse(url=url)

# 구글 OAuth 콜백
@app.get("/auth/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")
    
    # Access Token 요청
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": "http://localhost:8000/auth/google/callback"
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_result = token_response.json()
        
        if "access_token" not in token_result:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        # 사용자 정보 요청
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={token_result['access_token']}"
        user_response = await client.get(user_info_url)
        user_data = user_response.json()
        
        # 사용자 DB 처리
        existing_user = await db.users.find_one({
            "email": user_data["email"],
            "provider": "google"
        })
        
        if existing_user:
            # 기존 사용자 로그인
            user_info = existing_user
        else:
            # 새 사용자 생성
            new_user = {
                "name": user_data["name"],
                "email": user_data["email"],
                "provider": "google",
                "provider_id": user_data["id"],
                "profile_picture": user_data.get("picture", ""),
                "created_at": datetime.utcnow()
            }
            result = await db.users.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            user_info = new_user
        
        # JWT 생성
        token = create_jwt_token(user_info)
        
        # 프론트엔드로 리디렉션
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={token}"
        return RedirectResponse(url=redirect_url)

# 카카오 OAuth 시작
@app.get("/auth/kakao")
async def kakao_login():
    kakao_auth_url = "https://kauth.kakao.com/oauth/authorize"
    params = {
        "client_id": settings.KAKAO_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/auth/kakao/callback",
        "response_type": "code"
    }
    url = f"{kakao_auth_url}?{urlencode(params)}"
    return RedirectResponse(url=url)

# 카카오 OAuth 콜백
@app.get("/auth/kakao/callback")
async def kakao_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")
    
    # Access Token 요청
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": settings.KAKAO_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/auth/kakao/callback",
        "code": code
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            token_url,
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        token_result = token_response.json()
        
        if "access_token" not in token_result:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        # 사용자 정보 요청 <- KAKAO 정보 미 제공으로 일시적 비활성화 유지
        user_info_url = "https://kapi.kakao.com/v2/user/me"
        user_response = await client.get(
            user_info_url,
            headers={"Authorization": f"Bearer {token_result['access_token']}"}
        )
        user_data = user_response.json()
        print(user_data)

        # 카카오 사용자 정보 처리
        # kakao_account = user_data["kakao_account"]
        # profile = kakao_account["profile"]
        
        # 사용자 DB 처리
        # existing_user = await db.users.find_one({ "email": user_data["email"], "provider": "kakao" })
        
        # if existing_user:
        #     # 기존 사용자 로그인
        #     user_info = existing_user
        # else:
        #     # 새 사용자 생성
        #     new_user = {
        #         "name": profile["nickname"],
        #         "email": kakao_account["email"],
        #         "provider": "kakao",
        #         "provider_id": str(user_data["id"]),
        #         "profile_picture": profile.get("profile_image_url", ""),
        #         "created_at": datetime.utcnow()
        #     }
        #     result = await db.users.insert_one(new_user)
        #     new_user["_id"] = result.inserted_id
        #     user_info = new_user
        
        # # JWT 생성
        # token = create_jwt_token(user_info)
        
        # # 프론트엔드로 리디렉션
        # redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={token}"
        # return RedirectResponse(url=redirect_url)
    
        # 테스트용 임시값
        email = "test@example.com"
        name = "테스트 유저"
        provider_id = "temporary_id"
        profile_image = ""

        # DB 처리 로직은 그대로 사용
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if existing_user:
            user_info = existing_user
        else:
            new_user = {
                "name": name,
                "email": email,
                "provider": "kakao",
                "provider_id": provider_id,
                "profile_picture": profile_image,
                "created_at": datetime.utcnow()
            }
            result = await db.users.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            user_info = new_user

        token = create_jwt_token(user_info)
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={token}"
        return RedirectResponse(url=redirect_url)

# 건강 체크용 루트 엔드포인트
@app.get("/")
def read_root():
    return {"status": "FastAPI 서버가 실행 중입니다."}
