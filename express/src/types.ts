import z, { email } from "zod"
export const SignupSchmea= z.object({
    usenamme:z.string(),
    password:z.string(),
    email:z.email()
})
export const SigninSchmea= z.object({
    email:z.email(),
    password:z.string()
})