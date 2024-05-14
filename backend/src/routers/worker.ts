import { PrismaClient } from '@prisma/client';
import {createClient} from 'redis';

const redisClient = createClient();
const prismaClient = new PrismaClient();

async function PushDataIntoDB(temp:{key:string, element:string} | null){
    // @ts-ignore
    const response = JSON.parse(temp?.element);
    const email = response.email, roomId = response.roomId, message = response.message; 
    const roomExist = await prismaClient.chatRoom.findFirst({
        where:{
            roomId
        }
    });

    const chats:string[] = roomExist?.chats || [];
    chats.push(JSON.stringify({
        email, message
    }));

    await prismaClient.chatRoom.update({
        where:{
            roomId
        },
        data:{
            chats
        }
    });
}


async function Worker(){
    try {
        await redisClient.connect();
        console.log("Worker connected to the Redis");

        while(1){
            const temp:{key:string, element:string} | null = await redisClient.brPop('PushIntoDB', 0);
            console.log(temp);
            
            PushDataIntoDB(temp);
        }
        
    } catch (error) {
        console.log('Error on redis client in ', error);
    }
}

export default Worker;