import mongoose, { Document, Schema } from "mongoose";

interface Chat extends Document {
  chatName: string;
  isGroup: boolean;
  user: mongoose.Schema.Types.ObjectId[];
  latestMessage: mongoose.Schema.Types.ObjectId;
  groupAdmin: mongoose.Schema.Types.ObjectId[];
}

const chatSchema = new Schema<Chat>({
  chatName: {
    type: String,
    trim: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  latestMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  groupAdmin: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const ChatModel = mongoose.model<Chat>("Chat", chatSchema);

export default ChatModel;
