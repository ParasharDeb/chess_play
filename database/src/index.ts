import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const Schema = mongoose.Schema;
const ObjectId=Schema.ObjectId
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.DATABASE_URL ;
  console.log(uri)
  //@ts-ignore
  await mongoose.connect(uri)
  console.log("Mongo connected");
}
const winnerEnum = ["white", "black", "draw","none"];
const User = new Schema({
  name: {type:String,required:true,unique:true},
  email: {type: String, unique: true},
  password: {type:String,required:true},
  rating: {type:Number,default:800}
});
const Games= new  Schema({
  whiteplayer:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  blackplayer:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  moves:[],
  winner:{type:String,enum:winnerEnum,default:"none"}
})

export const UserModel = mongoose.model('User', User);
export const GamesModel=mongoose.model('games',Games)
