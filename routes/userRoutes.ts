import { Router } from "express";
import { authUser, registerUser , allUsers } from "../controllers/user.controller";
import { protect } from "../middlewares/authMiddleware";
export const router = Router();

router.route('/').post(registerUser).get(protect,allUsers)
router.route('/login').post(authUser)