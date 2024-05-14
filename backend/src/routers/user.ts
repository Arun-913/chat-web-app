import { Router } from "express";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";
import {z} from 'zod';
import { encryptData, decryptData } from "../encrypt";

const router = Router();
const prisamClient = new PrismaClient();

const profileSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

const profileSignupSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

router.post('/signin', async(req, res) =>{
    const {email, password} = req.body;
    try {
        const validatedData = profileSigninSchema.parse({email, password});
    } catch (error) {
        return res.status(400).json(error);
    }

    const existingUser = await prisamClient.profile.findFirst({
        where:{
            email
        }
    });

    if(existingUser){
        if(decryptData(existingUser.password) != password){
            return res.status(400).json({
                message: 'Password is incorrect'
            })
        }
        const authToken = jwt.sign({
            email, 
            password: existingUser.password
        }, process.env.JWT_AUTH_SECRET as string);
        
        res.json({
            authToken
        })
    }
    else{
        return res.status(400).json({
            message: 'User does not exist, please signup'
        });
    }
})

router.post('/signup', async(req, res)=>{
    const {name, email, password} = req.body;
    try {
        const validatedData = profileSignupSchema.parse({name, email, password});
    } catch (error) {
        return res.status(400).json(error);
    }

    const existingUser = await prisamClient.profile.findFirst({
        where:{
            email
        }
    });

    if(!existingUser){
        const encryptPassword = encryptData(password);
        await prisamClient.profile.create({
            data:{
                name,
                email,
                password: encryptPassword
            }
        });

        const authToken = jwt.sign({
            email,
            password: encryptPassword
        }, process.env.JWT_AUTH_SECRET as string);

        res.json({
            authToken
        });
    }
    else{
        return res.status(400).json({
            message: 'User already exist, please sigin'
        })
    }
})

export default router;
