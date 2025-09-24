# backend/app/main.py
import os
import bcrypt
import jwt
import httpx
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from fastapi import FastAPI, HTTPException, status, Request, Query
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

# 학습 계획 Pydantic 모델
class StudyPlanCreate(BaseModel):
    title: str
    type: str  # study, quiz, project, review
    date: str  # YYYY-MM-DD format
    start_time: Optional[str] = None  # HH:MM format
    end_time: Optional[str] = None  # HH:MM format
    description: Optional[str] = None
    completed: bool = False

class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# 로그인 엔드포인트
@app.post("/api/login")
async def login_user(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not bcrypt.checkpw(user.password.encode(), db_user["hashed_password"].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="이메일 또는 비밀번호가 잘못되었습니다.")
    return {"message": f"{db_user['name']}님, 환영합니다!"}

# 회원가입 엔드포인트
@app.post("/api/signup", status_code=status.HTTP_201_CREATED)
async def signup_user(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미 등록된 이메일입니다.")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    await db.users.insert_one({"name": user.name, "email": user.email, "hashed_password": hashed})
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
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
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
        # existing_user = await db.users.find_one({"email": kakao_account["email"]})
        
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
        existing_user = await db.users.find_one({"email": email})
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

# 학습 계획 생성 엔드포인트
@app.post("/api/study-plans", status_code=status.HTTP_201_CREATED)
async def create_study_plan(plan: StudyPlanCreate, user_email: str = Query(...)):
    try:
        # 사용자 존재 확인
        user = await db.users.find_one({"email": user_email})
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 학습 계획 데이터 준비
        plan_data = {
            "user_email": user_email,
            "user_id": str(user["_id"]),
            "title": plan.title,
            "type": plan.type,
            "date": plan.date,
            "start_time": plan.start_time,
            "end_time": plan.end_time,
            "description": plan.description,
            "completed": plan.completed,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # MongoDB에 저장
        result = await db.study_plans.insert_one(plan_data)

        # 생성된 계획 반환
        created_plan = await db.study_plans.find_one({"_id": result.inserted_id})
        created_plan["_id"] = str(created_plan["_id"])

        return {"message": "학습 계획이 성공적으로 생성되었습니다.", "plan": created_plan}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 생성 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 조회 엔드포인트
@app.get("/api/study-plans")
async def get_study_plans(user_email: str = Query(...)):
    try:
        # 사용자 존재 확인
        user = await db.users.find_one({"email": user_email})
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 해당 사용자의 학습 계획 조회
        cursor = db.study_plans.find({"user_email": user_email}).sort("date", 1)
        plans = await cursor.to_list(length=None)

        # ObjectId를 문자열로 변환
        for plan in plans:
            plan["_id"] = str(plan["_id"])

        return {"plans": plans}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 조회 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 수정 엔드포인트
@app.put("/api/study-plans/{plan_id}")
async def update_study_plan(plan_id: str, plan: StudyPlanUpdate, user_email: str = Query(...)):
    try:
        # ObjectId 유효성 검증
        if not ObjectId.is_valid(plan_id):
            raise HTTPException(status_code=400, detail="잘못된 계획 ID입니다.")

        # 사용자 존재 확인
        user = await db.users.find_one({"email": user_email})
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 기존 계획 확인
        existing_plan = await db.study_plans.find_one({
            "_id": ObjectId(plan_id),
            "user_email": user_email
        })
        if not existing_plan:
            raise HTTPException(status_code=404, detail="학습 계획을 찾을 수 없습니다.")

        # 업데이트할 필드만 추출
        update_data = {}
        for field, value in plan.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value

        if update_data:
            update_data["updated_at"] = datetime.utcnow()

            # MongoDB에서 업데이트
            result = await db.study_plans.update_one(
                {"_id": ObjectId(plan_id), "user_email": user_email},
                {"$set": update_data}
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="업데이트할 내용이 없습니다.")

        # 업데이트된 계획 반환
        updated_plan = await db.study_plans.find_one({"_id": ObjectId(plan_id)})
        updated_plan["_id"] = str(updated_plan["_id"])

        return {"message": "학습 계획이 성공적으로 수정되었습니다.", "plan": updated_plan}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 수정 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 삭제 엔드포인트
@app.delete("/api/study-plans/{plan_id}")
async def delete_study_plan(plan_id: str, user_email: str = Query(...)):
    try:
        # ObjectId 유효성 검증
        if not ObjectId.is_valid(plan_id):
            raise HTTPException(status_code=400, detail="잘못된 계획 ID입니다.")

        # 사용자 존재 확인
        user = await db.users.find_one({"email": user_email})
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 기존 계획 확인
        existing_plan = await db.study_plans.find_one({
            "_id": ObjectId(plan_id),
            "user_email": user_email
        })
        if not existing_plan:
            raise HTTPException(status_code=404, detail="학습 계획을 찾을 수 없습니다.")

        # MongoDB에서 삭제
        result = await db.study_plans.delete_one({
            "_id": ObjectId(plan_id),
            "user_email": user_email
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="삭제할 계획이 없습니다.")

        return {"message": "학습 계획이 성공적으로 삭제되었습니다."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 삭제 중 오류가 발생했습니다: {str(e)}")

# 건강 체크용 루트 엔드포인트
@app.get("/")
def read_root():
    return {"status": "FastAPI 서버가 실행 중입니다."}
