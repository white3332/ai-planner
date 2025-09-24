## 🗂️ 프로젝트 구조

```
ai-planner/
├── backend/
│   ├── app/                    # 애플리케이션 핵심 로직
│   ├── main.py                 # 서버 실행 시작점
│   ├── .env                    # 환경 변수 (민감 정보)
│   ├── .env.example            # .env 예시 파일
│   ├── docker-compose.yml      # 도커 컨테이너 설정
│   ├── Dockerfile              # 도커 이미지 생성 파일
│   └── requirements.txt        # 파이썬 라이브러리 목록
│
├── frontend/
│   ├── node_modules/           # npm 종속성 (자동 생성)
│   ├── public/
│   │   └── index.html          # React 앱 기본 HTML
│   ├── src/
│   │   ├── api/
│   │   │   ├── request_login.js  # API 호출 함수
│   │   │   └── social_login.js   # 소셜 로그인 API
│   │   ├── components/
│   │   │   ├── authcallback/
│   │   │   │   ├── AuthComponents.js
│   │   │   │   └── AuthPage.module..css
│   │   │   ├── landing/
│   │   │   │   ├── LandingComponents.js
│   │   │   │   └── LandingPage.module..css
│   │   │   ├── dashboard/
│   │   │   │   └── (대시보드 UI 컴포넌트)
│   │   │   └── login/
│   │   │       ├── LoginComponents.js
│   │   │       └── LoginPage.module..css
│   │   ├── pages/
│   │   │   ├── AuthCallbackPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── LandingPage.js
│   │   │   └── LoginPage.js
│   │   ├── App.js               # 최상위 컴포넌트 (라우팅)
│   │   ├── App.css              # 전역 스타일
│   │   └── index.js             # React 앱 진입점
│   ├── package.json             # 프로젝트 메타·의존성 정보
│   └── yarn.lock                # 의존성 버전 고정
│
├── test/                        # 테스트 코드
│   └── (테스트 파일들)
├── .gitattributes               # Git 속성 설정
├── .gitignore                   # Git 무시 목록
└── README.md                    # 프로젝트 설명서

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
