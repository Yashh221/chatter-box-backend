import mongoose, { Document, Schema } from "mongoose";
import { UserDocument} from "./userModel";
interface Message extends Document{
    sender:mongoose.Schema.Types.ObjectId | UserDocument,
    content:string,
    chat:mongoose.Schema.Types.ObjectId
}

const messageSchema  = new Schema<Message>({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type:Schema.Types.ObjectId,
        ref:"Chat"
    }
},
{
    timestamps:true
})

const MessageModel = mongoose.model<Message>("Message",messageSchema);
export default MessageModel;