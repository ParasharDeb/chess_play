import { connectDB, UserModel } from "@repo/database";
import express from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import jwt from "jsonwebtoken"
import {SigninSchmea,SignupSchmea} from "./types" 
const app= express();
app.use(express.json())
app.use(cors())
connectDB();
const JWT_SECRET="!@#$%^&2345t6yu"
app.post("/signup",async(req,res)=>{
    const user = SignupSchmea.parse(req.body)
    const userExists=await UserModel.findOne({
        email:user.email
    })
    if(userExists){
        res.json({
            message:"user already exists"
        })
        return
    }
    const hashedpassword= await bcrypt.hash(user.password,10)
    try{
        const player= await UserModel.create({
            name:user.username,
            password:hashedpassword,
            email:user.email
        })
        res.json({
            player
        })
    }
    catch(e){
        console.log(e)
    }
})  
app.post("/signin",async(req,res)=>{
    const user = SigninSchmea.parse(req.body);
    const userExists=await UserModel.findOne({
        email:user.email
    })
    if(!userExists){
        res.json({
            "message":"Email doesnt exist in database"
        })
        return
    }
    const correctpassword= await bcrypt.compare(user.password,userExists.password)
    if(!correctpassword){
        res.json({
            "message":"your password is wrong"
        })
        return
    }
    const token = jwt.sign({id:userExists._id},JWT_SECRET)
    res.json({
        token:token
    })
})
app.get("/getuser",async(req,res)=>{
    const token = req.headers.authorization?.split(" ")[1]
    console.log(token)
    if(!token){
        res.json({
            "message":"Unauthorized"
        })
        return
    }
    const decoded = jwt.verify(token,JWT_SECRET)
    if(!decoded){
        res.json({
            "message":"Unauthorized"
        })
        return
    }
    if (typeof decoded === "string") {
        return res.json({ message: "Unauthorized" });
    }
    const user = await UserModel.findById(decoded.id )
    if(!user){
        res.json({
            "message":"User not found"
        })
        return
    }
    // Return a consistent object shape so frontend can safely read `res.data.name`
    res.json({
        name: user.name,
        rating:user.rating
    })
})
app.post("/fixrating",(req,res)=>{
    
})
app.listen(3030)