import AsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";

export const sendMessage = AsyncHandler(async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    res.sendStatus(400).json({ message: "Invalid Data passed into request" });
    return;
  }
  const newMessage = {
    sender: req.body.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await (
      await message.populate("sender", "name pic")
    ).populate({
      path: "chat",
      select: "chatName isGroup user",
      model: "Chat",
      populate: { path: "user", select: "name email pic", model: "User" },
    });
    await Chat.findByIdAndUpdate(
      req.body.chatId,
      {
        latestMessage: message,
      },
      {
        new: true,
      }
    );
    res.status(200).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const allMessages = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).populate(
      "sender",
      "name pic email"
    )
    .populate("chat");
    res.status(200).json(messages)
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Chat Not Found" });
  }
});
