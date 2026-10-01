import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
            match: [
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ],
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address",
            ],
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        avatar: {
            url: {
                type: String,
                // required: true
                default:null
            },
            public_id: {
                type: String,
                // required: true
                default:null
            }
        },
        preferences: {
            theme: {
                type: String,
                enum: ["light", "dark"],
                default: "light",
            },
        },
        // role:{
        //     type:String,
        //     enum:["user","admin"],
        //     default:"user",
        // },

        // coverImage: {
        //     url: {
        //         type: String,
        //         // required: true
        //     },
        //     public_id: {
        //         type: String,
        //         // required: true
        //     }
        // },

        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_document, result) => {
                delete result.password;
                delete result.refreshToken;
                delete result.__v;
                return result;
            },
        },
    }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
    },
        config.accessTokenSecret, { expiresIn: config.accessTokenExpiry })
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiry })
}


const User = mongoose.model("User", userSchema);
export default User