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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const encrypt_1 = require("../encrypt");
const user_1 = require("../middlewares/user");
const chat_1 = require("../middlewares/chat");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const chatRoomCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    roomPassword: zod_1.z.string().min(8)
});
const chatRoomJoinSchema = zod_1.z.object({
    roomId: zod_1.z.coerce.number().int().gte(10000000).lte(99999999),
    roomPassword: zod_1.z.string().min(8)
});
router.post('/create/room', user_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const email = req.email;
    const { roomPassword } = req.body;
    try {
        const validatedData = chatRoomCreateSchema.parse({ email, roomPassword });
        console.log("Input is valid : ", validatedData);
    }
    catch (error) {
        return res.status(400).json(error);
    }
    const min = 10000000;
    const max = 99999999;
    let roomId = 100000;
    while (true) {
        roomId = Math.floor(Math.random() * (max - min + 1)) + min;
        const response = yield prismaClient.chatRoom.findFirst({
            where: {
                roomId
            }
        });
        if (!response) {
            break;
        }
    }
    const encryptedRoomPassword = (0, encrypt_1.encryptData)(roomPassword);
    yield prismaClient.chatRoom.create({
        data: {
            roomId,
            roomPassword: encryptedRoomPassword,
            chats: []
        }
    });
    const roomIdToken = jsonwebtoken_1.default.sign({
        roomId,
        roomPassword: encryptedRoomPassword
    }, process.env.JWT_ROOM_SECRET);
    res.json({
        roomIdToken,
        roomId
    });
}));
router.post('/join/room', user_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = typeof req.body.roomId === 'string' ? parseInt(req.body.roomId) : undefined;
    const roomPassword = req.body.roomPassword;
    try {
        const validatedData = chatRoomJoinSchema.parse({ roomId, roomPassword });
        console.log("Input is valid : ", validatedData);
    }
    catch (error) {
        return res.status(400).json(error);
    }
    console.log("join : ", roomId);
    const roomExist = yield prismaClient.chatRoom.findFirst({
        where: {
            roomId
        }
    });
    if (roomExist) {
        const decryptedRoomPassword = (0, encrypt_1.decryptData)(roomExist.roomPassword);
        if (decryptedRoomPassword === roomPassword) {
            const roomIdToken = jsonwebtoken_1.default.sign({
                roomId,
                roomPassword: roomExist.roomPassword
            }, process.env.JWT_ROOM_SECRET);
            res.json({
                roomIdToken,
                roomId
            });
        }
        else {
            res.status(400).json({
                message: 'Password is incorrect'
            });
        }
    }
    else {
        res.status(400).json({
            message: 'Room does exist, please create new chat room'
        });
    }
}));
router.post('/post', [user_1.authMiddleware, chat_1.roomIdMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currSchema = zod_1.z.string().min(1);
    const { message } = req.body;
    try {
        currSchema.parse(message);
    }
    catch (error) {
        return res.status(400).json(error);
    }
    // @ts-ignore
    const email = req.email, roomId = req.roomId, roomPassword = req.roomPassword;
    const roomExist = yield prismaClient.chatRoom.findFirst({
        where: {
            roomId
        }
    });
    // console.log(roomExist);
    if (roomExist) {
        // @ts-ignore
        // if(decryptData(roomExist.roomPassword) != roomPassword){
        //     return res.status(400).json({
        //         message: 'Room Password is incorrect'
        //     });
        // }
        const chats = (roomExist === null || roomExist === void 0 ? void 0 : roomExist.chats) || [];
        chats.push(JSON.stringify({
            email, message
        }));
        // console.log("here :" , chats);
        yield prismaClient.chatRoom.update({
            where: {
                roomId
            },
            data: {
                chats
            }
        });
        return res.status(200).json({
            message: 'success'
        });
    }
    else {
        return res.status(400).json({
            message: 'Room is not exist'
        });
    }
}));
router.get('/fetch', [user_1.authMiddleware, chat_1.roomIdMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const roomId = req.roomId, roomPassword = req.roomPassword;
    const roomExist = yield prismaClient.chatRoom.findFirst({
        where: {
            roomId
        }
    });
    if (roomExist) {
        // @ts-ignore
        // if(decryptData(roomExist.roomPassword) != roomPassword){
        //     return res.status(400).json({
        //         message: 'Room Password is incorrect'
        //     });
        // }
        return res.json(roomExist.chats);
    }
    else {
        return res.status(400).json({
            message: 'Room is not exist'
        });
    }
}));
exports.default = router;
