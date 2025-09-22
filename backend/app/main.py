# backend/app/main.py

import os
import bcrypt
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

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

# 건강 체크용 루트 엔드포인트
@app.get("/")
def read_root():
    return {"status": "FastAPI 서버가 실행 중입니다."}
