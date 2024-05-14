import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction} from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    const {authToken} = req.body;
    if(!authToken){
        return res.status(400).json({
            message: 'You are not login'
        });
    }
    
    try {
        const decoded = jwt.verify(authToken, process.env.JWT_AUTH_SECRET as string);
        // @ts-ignore
        req.email = decoded.email;
        // console.log(decoded);
        next();
    } catch (error) {
        return res.status(400).json({
            message: 'You are not login'
        });
    }
}