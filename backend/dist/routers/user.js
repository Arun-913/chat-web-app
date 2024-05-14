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
const express_1 = require("express");
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const encrypt_1 = require("../encrypt");
const router = (0, express_1.Router)();
const prisamClient = new client_1.PrismaClient();
const profileSigninSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
const profileSignupSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const validatedData = profileSigninSchema.parse({ email, password });
    }
    catch (error) {
        return res.status(400).json(error);
    }
    const existingUser = yield prisamClient.profile.findFirst({
        where: {
            email
        }
    });
    if (existingUser) {
        if ((0, encrypt_1.decryptData)(existingUser.password) != password) {
            return res.status(400).json({
                message: 'Password is incorrect'
            });
        }
        const authToken = jsonwebtoken_1.default.sign({
            email,
            password: existingUser.password
        }, process.env.JWT_AUTH_SECRET);
        res.json({
            authToken
        });
    }
    else {
        return res.status(400).json({
            message: 'User does not exist, please signup'
        });
    }
}));
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const validatedData = profileSignupSchema.parse({ name, email, password });
    }
    catch (error) {
        return res.status(400).json(error);
    }
    const existingUser = yield prisamClient.profile.findFirst({
        where: {
            email
        }
    });
    if (!existingUser) {
        const encryptPassword = (0, encrypt_1.encryptData)(password);
        yield prisamClient.profile.create({
            data: {
                name,
                email,
                password: encryptPassword
            }
        });
        const authToken = jsonwebtoken_1.default.sign({
            email,
            password: encryptPassword
        }, process.env.JWT_AUTH_SECRET);
        res.json({
            authToken
        });
    }
    else {
        return res.status(400).json({
            message: 'User already exist, please sigin'
        });
    }
}));
exports.default = router;
