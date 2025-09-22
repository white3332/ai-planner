---

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
ai-planner/backend 에서

도커 실행
docker-compose up --build


ai-planner/frontend 에서
npm install -g yarn
yarn install
yarn start

주의: 위 명령은 반드시 package.json 파일이 존재하는 폴더 내에서 실행
```