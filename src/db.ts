// crete user  models and schemas 

import mongoose, {model,Schema} from "mongoose"
import { string } from "zod";
import { required } from "zod/mini";

mongoose.connect("mongodb+srv://saquib_9310:ZjlgDoCvflaLsXf9@brainly.7ft3fok.mongodb.net/brainlyapp") //this has to change to with your own mongo db url

// mongoose.connect(process.env.MONGO_URL!);


const UserSchema = new Schema({
  username: {type:String,unique:true},
  password:String  
})

export const UserModel = model ("User",UserSchema);

const ContentSchema = new Schema({
  title:String,
  link:String,
  type:String,
  tags: [{type:mongoose.Types.ObjectId, ref:'Tag'}],
  userId:{type: mongoose.Types.ObjectId,ref:'User'},
})


const LinkSchema = new Schema({
  hash:String,
  userId:{type: mongoose.Types.ObjectId,ref: 'User' , required: true, unique:true },
})

export const LinkModel = model("Links",LinkSchema);
export const ContentModel = mongoose.model("Content",ContentSchema);