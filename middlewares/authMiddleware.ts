import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: string;
}

export const protect = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  let decoded: JwtPayload | string = '';

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (process.env.JWT_SECRET_KEY) {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      }
      if (typeof decoded === 'string') {
        res.status(400);
        throw new Error("Not Authorized..Failed!!!");
      } else {
        req.body.user = await User.findById(decoded.id).select("-password");
        next();
      }
    } catch (error) {
      res.status(400);
      throw new Error("Not Authorized..Failed");
    }
  }
});
