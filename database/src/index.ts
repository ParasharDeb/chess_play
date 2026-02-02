import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId=Schema.ObjectId
const User = new Schema({
  name: {type:String,required:true},
  email: {type: String, unique: true},
  password: {type:String,required:true},
  rating: {type:Number,default:800}
});

export const UserModel = mongoose.model('users', User);
