import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction} from 'express';

export function roomIdMiddleware(req: Request, res: Response, next: NextFunction){
    const {roomIdToken} = req.body;
    if(!roomIdToken){
        return res.status(400).json({
            message: 'Enter the roomId and Password'
        });
    }
    
    try {
        const decoded = jwt.verify(roomIdToken, process.env.JWT_ROOM_SECRET as string);
        // @ts-ignore
        req.roomId = decoded.roomId;
        // @ts-ignore
        req.roomPassword = decoded.roomPassword;
        // console.log(decoded);
        next();
    } catch (error) {
        return res.status(400).json({
            message: 'Enter the roomId and Password'
        });
    }
}