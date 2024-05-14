"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)();
function startRedisClient() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient.connect();
            console.log('Redis client connected to ws');
        }
        catch (error) {
            console.log('Error on redis client in ws : ', error);
        }
    });
}
startRedisClient();
let roomId = 0;
let email = '';
const connections = {};
const chatRoom = {};
const wsRouter = (wsServer) => {
    const router = (0, express_1.Router)();
    wsServer.on('connection', function connection(ws) {
        ws.on('error', console.error);
        console.log(chatRoom);
        const uuid = (0, crypto_1.randomUUID)();
        connections[uuid] = { socket: ws, authenticated: false };
        ws.on('message', (data) => {
            const message = JSON.parse(data);
            const connection = connections[uuid];
            if (message.type == 'authenticate') {
                connection.authenticated = authenticate(message.authToken, message.roomIdToken, uuid);
                return;
            }
            else if (message.type == 'message') {
                handleMessage(connection, message);
            }
        });
        ws.send(JSON.stringify({
            message: 'hello from server'
        }));
    });
    return router;
};
function handleMessage(connection, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection.authenticated) {
            chatRoom[roomId].forEach(client => {
                const clientConnection = connections[client.clientUUID];
                if (clientConnection && clientConnection.socket.readyState === ws_1.WebSocket.OPEN) {
                    clientConnection.socket.send(JSON.stringify({
                        email,
                        message: message.message
                    }));
                }
            });
            yield redisClient.lPush("PushIntoDB", JSON.stringify({ roomId, email, message: message.message }));
        }
        else {
            console.log('message not sent bcz you are not authenticated');
            // connection.terminate();
        }
    });
}
const authenticate = (authToken, roomIdToken, uuid) => {
    try {
        const decodedRoomId = jsonwebtoken_1.default.verify(roomIdToken, process.env.JWT_ROOM_SECRET);
        const decodedAuth = jsonwebtoken_1.default.verify(authToken, process.env.JWT_AUTH_SECRET);
        // @ts-ignore
        roomId = decodedRoomId.roomId, email = decodedAuth.email;
        if (!chatRoom[roomId]) {
            chatRoom[roomId] = [];
        }
        chatRoom[roomId].push({ clientUUID: uuid });
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.default = wsRouter;
