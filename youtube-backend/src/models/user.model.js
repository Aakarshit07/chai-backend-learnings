import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, 
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, 
            trim: true,
        },
        fullName: {
            type: String,
            required: true, 
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary Url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary Url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }

    }, 
    {timestapms: true}

);

//! Dont use arrow function here beacuse arrow function doesnt have access to this contenxt
userSchema.pre("save", async function(next) {
    //* With this condition we are making sure that only if password is changed then we will hash it. else we will not hash it.
    //! Passwrod Hashing PROBLEM: Suppose a user updated avatar then this hashing password will keep updating the hash.
    //* Thats why we use this.isModified("password") condition 

    if(!this.isModified("password")) return next();
   
    this.password = await bcrypt.hash(this.password, 10);
    next();
}) 

// creating custom methods 
// check is our password is correct or not
userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema);