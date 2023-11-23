import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import User from "../models/userModel";
import generateToken from "../config/generateToken";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password || !pic) {
      res.status(400);
      throw new Error("Please Enter all the fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already registered");
    }
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
    if (user) {
      res.status(201).json({
        message:"success",
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Failed to register the user");
    }
  }
);

export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email or password are missing.");
  }

  const user = await User.findOne({ email });

  if (user && (await user.isValidatePassword(password))) {
    res.status(200).json({
      message:"success",
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});
export const allUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const keyword = req.query.search && {
      $or: [
        {
          name: { $regex: req.query.search, $options: "i" },
        },
        {
          email: { $regex: req.query.search, $options: "i" },
        },
      ],
    };
    if (keyword) {
      const users = await User.find(keyword).find({
        _id: { $ne: req.body.user._id },
      });
      res.status(200).json({ users });
    }
  } catch (error) {
    res.status(400);
    throw new Error("User Not Found!!");
  }
});
