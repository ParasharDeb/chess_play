"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninSchmea = exports.SignupSchmea = void 0;
const zod_1 = __importDefault(require("zod"));
exports.SignupSchmea = zod_1.default.object({
    usenamme: zod_1.default.string(),
    password: zod_1.default.string(),
    email: zod_1.default.email()
});
exports.SigninSchmea = zod_1.default.object({
    email: zod_1.default.email(),
    password: zod_1.default.string()
});
