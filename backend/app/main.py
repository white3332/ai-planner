# backend/app/main.py

import os
import bcrypt
import jwt
import httpx
from datetime import datetime, timedelta
from typing import Optional, Any, List 
from bson import ObjectId
from fastapi import FastAPI, HTTPException, status, Request, Response, Query, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
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

# 대시보드 통계 응답 모델 정의
class DashboardStatsResponse(BaseModel):
    today_hours: float
    weekly_progress: int
    streak_days: int
    total_points: int

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any, field: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

# API 응답을 위한 Pydantic 모델
class StudyPlanResponseModel(BaseModel):
    # MongoDB의 '_id'를 'id' 필드로 받아서 문자열로 변환해줍니다.
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    type: str
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None
    completed: bool

    class Config:
        # ObjectId 타입을 JSON으로 인코딩할 수 있도록 허용
        json_encoders = {ObjectId: str}

# 클라이언트가 "/api/login" 경로로 아이디/비밀번호를 보내 토큰을 받아가도록 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# 현재 사용자를 가져오는 Dependency 함수
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 토큰 디코딩
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # 토큰에서 얻은 user_id로 DB에서 사용자 조회
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

# JWT 토큰 생성 함수
def create_jwt_token(user_data: dict) -> str:
    payload = {
        "user_id": str(user_data["_id"]),
        "email": user_data["email"],
        "name": user_data["name"],
        "provider": user_data.get("provider", ""),
        "exp": datetime.utcnow() + timedelta(hours=24)  # 24시간 후 만료
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

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

        # 카카오 사용자 정보 처리
        kakao_account = user_data.get("kakao_account", {})
        profile = kakao_account.get("profile", {})
        email = kakao_account.get("email")

        if not email:
            raise HTTPException(status_code=400, detail="카카오 계정에서 이메일 정보를 가져올 수 없습니다.")

        # 사용자 DB 처리
        existing_user = await db.users.find_one({"email": email, "provider": "kakao"})
        
        if existing_user:
            # 기존 사용자 로그인
            user_info = existing_user
        else:
            # 새 사용자 생성
            new_user = {
                "name": profile.get("nickname", "사용자"),
                "email": email,
                "provider": "kakao",
                "provider_id": str(user_data["id"]),
                "profile_picture": profile.get("profile_image_url", ""),
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
    


# 학습 계획 생성 엔드포인트
@app.post("/api/study-plans", status_code=status.HTTP_201_CREATED, response_model=StudyPlanResponseModel)
async def create_study_plan(plan: StudyPlanCreate, current_user: dict = Depends(get_current_user)):
    try:
        # 학습 계획 데이터 준비
        plan_data = {
            "user_id": current_user["_id"], 
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

        return created_plan 

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 생성 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 조회 엔드포인트
@app.get("/api/study-plans", response_model=List[StudyPlanResponseModel])
async def get_study_plans(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]

        # 해당 사용자의 학습 계획 조회
        cursor = db.study_plans.find({"user_id": user_id}).sort("date", 1)
        plans = await cursor.to_list(length=None)

        return plans 

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 조회 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 수정 엔드포인트
@app.put("/api/study-plans/{plan_id}", response_model=StudyPlanResponseModel)
async def update_study_plan(plan_id: str, plan: StudyPlanUpdate, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]

        # ObjectId 유효성 검증
        if not ObjectId.is_valid(plan_id):
            raise HTTPException(status_code=400, detail="잘못된 계획 ID입니다.")

        # 기존 계획 확인
        existing_plan = await db.study_plans.find_one({
            "_id": ObjectId(plan_id),
            "user_id": user_id
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
                {"_id": ObjectId(plan_id), "user_id": user_id},
                {"$set": update_data}
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="업데이트할 내용이 없습니다.")

        # 업데이트된 계획 반환
        updated_plan = await db.study_plans.find_one({"_id": ObjectId(plan_id)})

        return updated_plan

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 수정 중 오류가 발생했습니다: {str(e)}")

# 학습 계획 삭제 엔드포인트
@app.delete("/api/study-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]

        # ObjectId 유효성 검증
        if not ObjectId.is_valid(plan_id):
            raise HTTPException(status_code=400, detail="잘못된 계획 ID입니다.")

        # 사용자 존재 확인
        user = await db.users.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 기존 계획 확인
        existing_plan = await db.study_plans.find_one({
            "_id": ObjectId(plan_id),
            "user_id": user_id
        })
        if not existing_plan:
            raise HTTPException(status_code=404, detail="학습 계획을 찾을 수 없습니다.")

        # MongoDB에서 삭제
        result = await db.study_plans.delete_one({
            "_id": ObjectId(plan_id),
            "user_id": user_id
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="삭제할 계획이 없습니다.")

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학습 계획 삭제 중 오류가 발생했습니다: {str(e)}")




# 대시보드 통계 조회 엔드포인트
@app.get("/api/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]

        # 사용자 존재 확인
        user = await db.users.find_one({"user_id": user_id}) 
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        # 오늘 날짜
        today = datetime.utcnow().strftime("%Y-%m-%d")

        # 이번 주 월요일부터 일요일까지
        today_date = datetime.utcnow().date()
        monday = today_date - timedelta(days=today_date.weekday())
        sunday = monday + timedelta(days=6)
        monday_str = monday.strftime("%Y-%m-%d")
        sunday_str = sunday.strftime("%Y-%m-%d")

        # 1. 오늘 학습 시간 계산
        today_plans = await db.study_plans.find({
            "user_id": user_id,
            "date": today,
            "completed": True
        }).to_list(None)

        today_hours = 0
        for plan in today_plans:
            if plan.get("start_time") and plan.get("end_time"):
                try:
                    start_parts = plan["start_time"].split(":")
                    end_parts = plan["end_time"].split(":")
                    start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
                    end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
                    duration_minutes = end_minutes - start_minutes
                    if duration_minutes > 0:
                        today_hours += duration_minutes / 60
                except:
                    continue

        # 2. 주간 진행률 계산 (완료된 계획 개수 기준)
        weekly_plans = await db.study_plans.find({ 
            "user_id": user_id,
            "date": {"$gte": monday_str, "$lte": sunday_str}
        }).to_list(None)

        weekly_progress = 0
        if weekly_plans:
            completed_count = len([p for p in weekly_plans if p.get("completed")])
            total_count = len(weekly_plans)
            weekly_progress = round((completed_count / total_count) * 100) if total_count > 0 else 0

        # 3. 연속 학습일 계산
        streak_days = 0
        current_date = today_date

        while streak_days < 365:  # 최대 1년까지만 확인
            date_str = current_date.strftime("%Y-%m-%d")

            daily_completed = await db.study_plans.find_one({ 
                "user_id": user_id,
                "date": date_str,
                "completed": True
            })

            if daily_completed:
                streak_days += 1
                current_date -= timedelta(days=1)
            else:
                break

        # 4. 총 포인트 (간단히 완료된 계획 수 × 10)
        total_completed = await db.study_plans.count_documents({
            "user_id": user_id,
            "completed": True
        })
        total_points = total_completed * 10

        return {
            "today_hours": round(today_hours, 1),
            "weekly_progress": weekly_progress,
            "streak_days": streak_days,
            "total_points": total_points
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 중 오류가 발생했습니다: {str(e)}")



# 건강 체크용 루트 엔드포인트
@app.get("/")
def read_root():
    return {"status": "FastAPI 서버가 실행 중입니다."}
