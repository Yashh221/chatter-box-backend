import express from 'express'
import { protect } from '../middlewares/authMiddleware'
import { accessChat,fetchChat,createGroupChat,renameGroup, addToGroup, removeFromGroup } from '../controllers/chat.controller';

const chatRouter = express.Router();

chatRouter.route("/").post(protect,accessChat)//accessChat
chatRouter.route("/").get(protect,fetchChat)
chatRouter.route("/group").post(protect,createGroupChat)
chatRouter.route("/renamegroup").put(protect,renameGroup)
chatRouter.route("/removefromgroup").put(protect,removeFromGroup)
chatRouter.route("/addtogroup").put(protect,addToGroup)

export default chatRouter;