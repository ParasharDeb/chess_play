import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId=Schema.ObjectId
const User = new Schema({
  name: String,
  email: {type: String, unique: true},
  password: String
});

const Todo = new Schema({
    userId: ObjectId,
    title: String,
    done: Boolean
});

export const UserModel = mongoose.model('users', User);
export const TodoModel = mongoose.model('todos', Todo);

// module.exports = {
//     UserModel,
//     TodoModel
// }