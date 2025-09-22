## 🗂️ 프로젝트 구조

```
ai-planner/
├── frontend/  
│   ├── public/  
│   │   └── index.html  
│   ├── src/  
│   │   ├── App.js  
│   │   ├── App.css  
│   │   ├── index.js  
│   │   ├── request_login.js  
│   │   └── social_login.js  <- 미완성
│   ├── package.json  
│   └── yarn.lock  
└── backend/  
    ├── app/  
    │   └── main.py  
    ├── requirements.txt  
    ├── Dockerfile  
    └── docker-compose.yml 
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
```