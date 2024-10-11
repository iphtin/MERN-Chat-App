import mongoose, { Schema } from "mongoose";

const MessagesSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   
        required: true
    }],
    group: {
        type: Schema.Types.ObjectId, 
        ref: 'Group', 
    },
    message: {
        text: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: ''
        }
    },
    sentAt: {
        type: Date,
        default: Date.now 
    }
});

const Messages = mongoose.model("Messages", MessagesSchema);

export default Messages;
