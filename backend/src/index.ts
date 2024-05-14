import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import userRouter from './routers/user';
import chatRouter from './routers/chat';
import wsRouter from './routers/ws';
import Worker from './routers/worker';
import { PrismaClient } from '@prisma/client';

const wsServer = new WebSocketServer({port: 8080});

const app = express();
app.use(express.json());
app.use(cors());


app.use('/', wsRouter(wsServer));
app.use('/v1/user', userRouter);
app.use('/v1/chat', chatRouter);
app.listen(8000, () => console.log('Server running at port 8000'));

Worker();