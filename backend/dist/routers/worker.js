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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)();
const prismaClient = new client_1.PrismaClient();
function PushDataIntoDB(temp) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const response = JSON.parse(temp === null || temp === void 0 ? void 0 : temp.element);
        const email = response.email, roomId = response.roomId, message = response.message;
        const roomExist = yield prismaClient.chatRoom.findFirst({
            where: {
                roomId
            }
        });
        const chats = (roomExist === null || roomExist === void 0 ? void 0 : roomExist.chats) || [];
        chats.push(JSON.stringify({
            email, message
        }));
        yield prismaClient.chatRoom.update({
            where: {
                roomId
            },
            data: {
                chats
            }
        });
    });
}
function Worker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient.connect();
            console.log("Worker connected to the Redis");
            while (1) {
                const temp = yield redisClient.brPop('PushIntoDB', 0);
                console.log(temp);
                PushDataIntoDB(temp);
            }
        }
        catch (error) {
            console.log('Error on redis client in ', error);
        }
    });
}
exports.default = Worker;
