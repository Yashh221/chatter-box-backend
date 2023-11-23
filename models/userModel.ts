import { NextFunction } from "express";
import mongoose from "mongoose";
import { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
export interface UserDocument extends User,Document {}
export interface User extends Document {
  name: string;
  email: string;
  password: string;
  pic: string;
  isValidatePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.hashPassword = async function (next: NextFunction) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    next(error);
  }
};


userSchema.pre('save',userSchema.methods.hashPassword);
userSchema.methods.isValidatePassword = async function(password:string) {
    return await bcrypt.compare(password,this.password);
}


const UserModel = mongoose.model<User>("User", userSchema);
export default UserModel;
