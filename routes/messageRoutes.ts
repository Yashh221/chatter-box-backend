import express from 'express';
import { allMessages, sendMessage } from '../controllers/message.controllers';
import { protect } from '../middlewares/authMiddleware';

const messageRouter = express.Router();

messageRouter.route("/").post(protect,sendMessage);
messageRouter.route("/:chatId").get(protect,allMessages);

export default messageRouter;