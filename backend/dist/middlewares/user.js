"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const { authToken } = req.body;
    if (!authToken) {
        return res.status(400).json({
            message: 'You are not login'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(authToken, process.env.JWT_AUTH_SECRET);
        // @ts-ignore
        req.email = decoded.email;
        // console.log(decoded);
        next();
    }
    catch (error) {
        return res.status(400).json({
            message: 'You are not login'
        });
    }
}
exports.authMiddleware = authMiddleware;
