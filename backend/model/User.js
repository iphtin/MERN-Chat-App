import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        max: 50,
    },
    picture: {
        type: String,
        default: ""
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    lastMsg: {
        type: String,
        default: ""
    },
}, { timestamps: true});

const User = mongoose.model("User", UserSchema);

export default User;