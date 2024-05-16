import { WebSocket, WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import jwt, {JwtPayload} from 'jsonwebtoken'
import { Router } from 'express';
import { createClient } from 'redis';

const redisClient = createClient();

async function startRedisClient(){
    try {
        await redisClient.connect();
        console.log('Redis client connected to ws');
    } catch (error) {
        console.log('Error on redis client in ws : ', error);
    }
}

startRedisClient();

type Connection = {
    socket: WebSocket;
    authenticated: boolean;
}

type Message = {
    type: string,
    authToken: string;
    roomIdToken: string;
    email?: string;
    message?: string;
}

let connections: { [key: string]: Connection } = {};
const chatRoom: { [key: number]: { clientUUID: string}[]} = {};

const wsRouter = (wsServer: WebSocketServer) =>{
    const router = Router();

    wsServer.on('connection', function connection(ws: WebSocket){
        ws.on('error', console.error);
    
        const uuid = randomUUID();
        connections[uuid] = { socket: ws, authenticated: false};
    
        ws.on('message', (data:string)=>{
            const message = JSON.parse(data);
            const connection = connections[uuid];
            if(message.type == 'authenticate'){
                connection.authenticated = authenticate(message.authToken, message.roomIdToken, uuid);
                return;
            }
            else if(message.type == 'message'){
                handleMessage(connection, message, uuid);
            }
            else if(message.type === 'remove'){
                removeUser(uuid)
            }
        });
    });

    return router;
}

function removeUser(uuid: string){
    // @ts-ignore
    const roomId = jwt.verify(message.roomIdToken, process.env.JWT_ROOM_SECRET as string);
    // @ts-ignore
    chatRoom[roomId] = chatRoom[roomId].filter(element => element.clientUUID !== uuid);
    delete connections[uuid];    
}

async function handleMessage(connection: Connection, message: Message, uuid: string){
    try {
        if(connection.authenticated){
            const decodedAuthToken = jwt.verify(message.authToken, process.env.JWT_AUTH_SECRET as string);
            const decodedRoomIdToken = jwt.verify(message.roomIdToken, process.env.JWT_ROOM_SECRET as string);

            // @ts-ignore
            const roomId = decodedRoomIdToken.roomId, email = decodedAuthToken.email;
            chatRoom[roomId].forEach(client =>{
                if(client.clientUUID !== uuid){
                    const clientConnection = connections[client.clientUUID];
                    if (clientConnection && clientConnection.socket.readyState === WebSocket.OPEN) {
                        clientConnection.socket.send(JSON.stringify({
                            email,
                            message: message.message
                        }));
                    }
                }
            });
            
            await redisClient.lPush("PushIntoDB", JSON.stringify({roomId, email, message:message.message}));
        }
        else{
            console.log('message not sent bcz you are not authenticated');
            // connection.terminate();
        }        
    } catch (error) {
        console.log(error);
    }
}

const authenticate = (authToken: string, roomIdToken: string, uuid: string)=>{
    try {
        const decodedRoomIdToken = jwt.verify(roomIdToken, process.env.JWT_ROOM_SECRET as string);
        const decodedAuthToken = jwt.verify(authToken, process.env.JWT_AUTH_SECRET as string);
        // @ts-ignore
        const roomId = decodedRoomIdToken.roomId;
        console.log(roomId);
        console.log("chatRoom: ", chatRoom);
        
        if (!chatRoom[roomId]) {
            chatRoom[roomId] = [];
        }
        chatRoom[roomId].push({clientUUID: uuid});
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export default wsRouter;