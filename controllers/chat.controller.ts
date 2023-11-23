import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import Chat from "../models/chatModel";
import User from "../models/userModel";

export const accessChat = AsyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  let isChat, chatData;
  if (!userId) {
    res.sendStatus(400);
    throw new Error("UserId is missing");
  }

  isChat = await Chat.find({
    isGroup: false,
    $and: [
      {
        user: { $elemMatch: { $eq: req.body.user._id } },
      },
      {
        user: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("user", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    chatData = {
      chatName: "sender",
      isGroup: false,
      user: [req.body.user._id, userId],
    };
  }
  try {
    const createdChat = await Chat.create(chatData);
    const chat = await Chat.findOne({ _id: createdChat._id }).populate(
      "user",
      "-password"
    );
    res.status(200).json(chat);
  } catch (error) {
    res.status(400);
    throw new Error("Unable to access chat!!");
  }
});

export const fetchChat = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({
      user: { $elemMatch: { $eq: req.body.user._id } },
    })
      .populate("user", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    const result = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw new Error("No Chats Available");
  }
});

export const createGroupChat = async (req: Request, res: Response) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ message: "Please fill all the details!!" });
    }
    const users = JSON.parse(req.body.users);
    if (users.length < 2) {
      res
        .status(400)
        .json({ message: "Require more than 2 members to form a group chat." });
    }
    users.push(req.body.user);
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        user: users,
        isGroup: true,
        groupAdmin: req.body.user,
      });
      const chat = await Chat.findOne({ _id: groupChat._id })
        .populate("user", "-password")
        .populate("groupAdmin", "-password");
      res.status(200).json(chat);
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ message: "Group chat created successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const renameGroup = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const { grpId, name } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      grpId,
      { chatName: name },
      { new: true }
    )
      .populate("user", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedChat) {
      res.status(400).json({ message: "Group not found" });
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    console.log(error);
  }
});

export const addToGroup = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const { grpId, userId } = req.body;
    const updatedUsers = await Chat.findByIdAndUpdate(
      grpId,
      {
        $addToSet: { user: userId },
      },
      {
        new: true,
      }
    )
      .populate("user", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedUsers) {
      res.status(400).json({ message: "Data not found" });
    } else {
      res.status(200).json(updatedUsers);
    }
  } catch (error) {
    console.log(error);
  }
});
export const removeFromGroup = AsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { grpId, userId } = req.body;
      const updatedUsers = await Chat.findByIdAndUpdate(grpId, {
        $pull: { user: userId },
      },{
        new:true
      })
        .populate("user", "-password")
        .populate("groupAdmin", "-password");
      if (!updatedUsers) {
        res.status(400).json({ message: "Data not found" });
      } else {
        res.status(200).json(updatedUsers);
      }
    } catch (error) {
      console.log(error);
    }
  }
);
