I build real-time chat application where I used React as Frontend and NodeJs as Backend

High Level System Design
![image](https://github.com/Arun-913/chat-web-app/assets/138594295/eccc17fa-c846-40ea-82c0-40baffb813f1)

To run the code in your local machine:
1. Fork the repo

2. To copy the .env.example file, run command:
   - cp frontend/.env.example frontend/.env
   - cp backend/.env.example backend/.env

3. Add the enviroment varaible like databaseurl, redisurl, etc

4. To Start Backend, run command:
   - cd backend
   - npm install
   - tsc -b
   - node dist/index.js

5. To Start Frontend, run command:
   - cd frontend
   - npm install
   - npm run dev
