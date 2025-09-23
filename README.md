## 🗂️ 프로젝트 구조

```
ai-planner/
├── frontend/                 # React 프론트엔드
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # 메인 앱 컴포넌트 (라우팅 포함)
│   │   ├── App.css          # 스타일링
│   │   ├── index.js         # React 앱 진입점
│   │   ├── AuthCallback.js  # 소셜 로그인 콜백 처리
│   │   ├── Dashboard.js     # 로그인 후 메인 페이지
│   │   ├── request_login.js # 일반 로그인/회원가입 요청
│   │   └── social_login.js  # 소셜 로그인 리디렉션
│   ├── package.json
│   └── yarn.lock
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   └── main.py          # FastAPI 메인 애플리케이션
│   ├── requirements.txt     # Python 의존성
│   ├── Dockerfile          # 백엔드 컨테이너 설정
│   ├── docker-compose.yml  # Docker 다중 컨테이너 설정
│   └── .env                # 환경 변수 (별도 설정 필요)
└── README.md
```

---

## 시스템 실행

```
# 1. 백엔드(FastAPI & MongoDB)
cd ai-planner/backend

# 도커/도커컴포즈 필요
docker-compose up --build



# 2. 프론트엔드(React)
cd ai-planner/frontend

npm install -g yarn  # yarn이 없을 때 한 번만
yarn install         # 의존성 설치
yarn start           # 개발서버 실행 (http://localhost:3000)


프론트엔드 개발 서버는 3000번, 백엔드는 8000번 포트


# 3. 환경 변수 설정
backend/.env 파일을 생성하고 다음 내용을 추가
# 구글 OAuth 설정 (Google Cloud Console에서 발급)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 카카오 OAuth 설정 (Kakao Developers에서 발급)
KAKAO_CLIENT_ID=your_kakao_rest_api_key

# JWT 보안 키 (임의의 복잡한 문자열)
JWT_SECRET_KEY=your_super_secret_jwt_key_here

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000

# MongoDB URL (Docker 사용 시 기본값 사용)
MONGODB_URL=mongodb://root:password@mongodb:27017/
```
