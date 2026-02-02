import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId=Schema.ObjectId
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect("mongodb://localhost:27017")
  console.log("Mongo connected");
}
const User = new Schema({

  name: {type:String,required:true},
  email: {type: String, unique: true},
  password: {type:String,required:true},
  rating: {type:Number,default:800}
});

export const UserModel = mongoose.model('users', User);
