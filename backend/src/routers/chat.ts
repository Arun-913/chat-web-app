import { PrismaClient } from "@prisma/client";
import { Response, Request, Router } from "express";
import { z } from 'zod';
import { encryptData, decryptData } from "../encrypt";
import { authMiddleware } from "../middlewares/user";
import { roomIdMiddleware } from "../middlewares/chat";
import jwt from 'jsonwebtoken';

const prismaClient = new PrismaClient();

const router = Router();

const chatRoomCreateSchema = z.object({
    email: z.string().email(),
    roomPassword: z.string().min(8)
});

const chatRoomJoinSchema = z.object({
    roomId: z.coerce.number().int().gte(10000000).lte(99999999),
    roomPassword: z.string().min(8)
});

router.post('/create/room', authMiddleware, async(req: Request, res: Response)=>{
    // @ts-ignore
    const email = req.email;
    const {roomPassword} = req.body;
    try {
        const validatedData = chatRoomCreateSchema.parse({email, roomPassword});
        console.log("Input is valid : ", validatedData);
    } catch (error) {
        return res.status(400).json(error);
    }

    const min = 10000000;
    const max = 99999999;
    let roomId:number = 100000;
    while(true){
        roomId = Math.floor(Math.random() * (max - min + 1)) + min;
        const response = await prismaClient.chatRoom.findFirst({
            where:{
                roomId
            }
        });
        if(!response){
            break;
        }
    }

    const encryptedRoomPassword: string = encryptData(roomPassword as string);

    await prismaClient.chatRoom.create({
        data:{
            roomId,
            roomPassword: encryptedRoomPassword,
            chats: []
        }
    });

    const roomIdToken = jwt.sign({
        roomId,
        roomPassword: encryptedRoomPassword
    }, process.env.JWT_ROOM_SECRET as string);
    
    res.json({
        roomIdToken,
        roomId
    });
});

router.post('/join/room', authMiddleware, async(req: Request, res:Response)=>{
    const roomId: number | undefined = typeof req.body.roomId === 'string' ? parseInt(req.body.roomId) : undefined;
    const roomPassword: string = req.body.roomPassword as string;

    try {
        const validatedData = chatRoomJoinSchema.parse({roomId, roomPassword});
        console.log("Input is valid : ", validatedData);
    } catch (error) {
        return res.status(400).json(error);
    }

    console.log("join : ", roomId);
    
    const roomExist = await prismaClient.chatRoom.findFirst({
        where:{
            roomId
        }
    });

    if(roomExist){
        const decryptedRoomPassword: string = decryptData(roomExist.roomPassword as string);

        if(decryptedRoomPassword === roomPassword){
            const roomIdToken = jwt.sign({
                roomId,
                roomPassword: roomExist.roomPassword
            }, process.env.JWT_ROOM_SECRET as string);
            
            res.json({
                roomIdToken,
                roomId
            });
        }
        else{
            res.status(400).json({
                message: 'Password is incorrect'
            });
        }
    }
    else{
        res.status(400).json({
            message: 'Room does exist, please create new chat room'
        });
    }
});


router.post('/post', [authMiddleware, roomIdMiddleware], async(req:Request, res:Response)=>{
    const currSchema = z.string().min(1);
    const {message} = req.body;
    try {
        currSchema.parse(message);
    } catch (error) {
        return res.status(400).json(error);
    }

    // @ts-ignore
    const email:string = req.email, roomId:number = req.roomId, roomPassword:string = req.roomPassword;
    
    const roomExist = await prismaClient.chatRoom.findFirst({
        where:{
            roomId
        }
    });
    
    if(roomExist){
        // @ts-ignore
        // if(decryptData(roomExist.roomPassword) != roomPassword){
        //     return res.status(400).json({
        //         message: 'Room Password is incorrect'
        //     });
        // }

        const chats:string[] = roomExist?.chats || [];
        chats.push(JSON.stringify({
            email, message
        }));

        // console.log("here :" , chats);

        await prismaClient.chatRoom.update({
            where:{
                roomId
            },
            data:{
                chats
            }
        });

        return res.status(200).json({
            message: 'success'
        });
    }
    else{
        return res.status(400).json({
            message: 'Room is not exist'
        })
    }
});

router.post('/fetch', [authMiddleware, roomIdMiddleware], async(req:Request, res: Response) =>{
    // @ts-ignore
    const roomId:number = req.roomId, roomPassword:string = req.roomPassword;
    const roomExist = await prismaClient.chatRoom.findFirst({
        where:{
            roomId
        }
    });

    if(roomExist){
        // @ts-ignore
        // if(decryptData(roomExist.roomPassword) != roomPassword){
        //     return res.status(400).json({
        //         message: 'Room Password is incorrect'
        //     });
        // }

        return res.json(roomExist.chats);
    }
    else{
        return res.status(400).json({
            message: 'Room is not exist'
        })
    }
});


export default router;