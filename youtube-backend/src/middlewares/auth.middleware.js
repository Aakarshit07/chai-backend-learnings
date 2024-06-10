import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT =  asyncHandler(async (req, res, next) => {
    try {
        //now from cookies we get the accessToken and refreshToken
        //and when user doesn't have token/cookies 
        //like in case of mobile application user might be sending a custom header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }   

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // now add the user into the request object
        // and as we have user in our request
        // now in logout we can access the user object from the request object. 
        req.user = user
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
   }
}); 