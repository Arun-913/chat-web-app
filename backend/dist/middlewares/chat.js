"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomIdMiddleware = void 0;
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function roomIdMiddleware(req, res, next) {
    const { roomIdToken } = req.body;
    if (!roomIdToken) {
        return res.status(400).json({
            message: 'Enter the roomId and Password'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(roomIdToken, process.env.JWT_ROOM_SECRET);
        // @ts-ignore
        req.roomId = decoded.roomId;
        // @ts-ignore
        req.roomPassword = decoded.roomPassword;
        // console.log(decoded);
        next();
    }
    catch (error) {
        return res.status(400).json({
            message: 'Enter the roomId and Password'
        });
    }
}
exports.roomIdMiddleware = roomIdMiddleware;
