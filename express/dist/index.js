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
const database_1 = require("@repo/database");
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("./types");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, database_1.connectDB)();
const JWT_SECRET = "!@#$%^&2345t6yu";
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = types_1.SignupSchmea.parse(req.body);
    const userExists = yield database_1.UserModel.findOne({
        email: user.email
    });
    if (userExists) {
        res.json({
            message: "user already exists"
        });
        return;
    }
    const hashedpassword = yield bcrypt_1.default.hash(user.password, 10);
    try {
        const player = yield database_1.UserModel.create({
            name: user.usenamme,
            password: hashedpassword,
            email: user.email
        });
        res.json({
            player
        });
    }
    catch (e) {
        console.log(e);
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = types_1.SigninSchmea.parse(req.body);
    const userExists = yield database_1.UserModel.findOne({
        email: user.email
    });
    if (!userExists) {
        res.json({
            "message": "Email doesnt exist in database"
        });
        return;
    }
    const correctpassword = yield bcrypt_1.default.compare(user.password, userExists.password);
    if (!correctpassword) {
        res.json({
            "message": "your password is wrong"
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: userExists._id }, JWT_SECRET);
    res.json(token);
}));
app.listen(3030);
