import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError }  from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        // we got the docuement of a user from db
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken() // we give this access token to user as its expiry is short and refresher often.
        const refreshToken = user.generateRefreshToken()
        
        // now set it into the database
        // as user object has acces the actual object from db
        // we can directly add the property in to our user / db. 
        user.refreshToken = refreshToken;

        //now we added the refresh token into db but we didn't saved the user object.
        //but when we save the user the mongoose model validation kicks in. 
        //means they check for every feild and like is password is required.
        //it will throw error as we dont have password right now.
        //so for this we need to pass an object with validateBeforeSave: false. 
        // this way it wont validate the user model. 
        await user.save({validateBeforeSave: false});

        // now return the accessToken and refreshToken
        return {accessToken, refreshToken};


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // steps to register user
    //1. get user details from frontend
    //2. validation - not empty
    //3. check if user already exists: username, email
    //4. check for images, check for avatar
    //5. upload them to cloudinary, avatar
    //6. create user object - create entry in db
    //7. remove password and refresh token feild from response
    //8. check for user creation
    //9. return response

    const {fullName, username, email, password } = req.body
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");  
    }

    //check user in db or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already existes");
    }

    // we get files access from multer
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        // here this select methods allows us to select the fields we want,
        // by default all fields are selected
        // as arguement we tell all the fileds we dont want using below syntax. 
       "-password -refreshToken" 
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    ) 

});

const loginUser = asyncHandler(async (req, res) => {
    // steps to login user
    //1. get user details from frontend
    //2. validation - check is any feild is empty or not.
    //3. middleware that is user exists or not
    //4. check is the email and password is correct or not
    //5. generate and send access token / refresh token.
    //6. send secure cookies 
    //7. now user is logged in successfully. 
    //8.return response. 

    const {email, username, password} = req.body;

    if(!username && !email) {
       throw new ApiError(400, "Username or email is required"); 
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user) {
        throw new ApiError(404, "User does not exists");
    }

    // try to access methods we created 
    // instead of using User object
    // we will user user that we build.
    // because the methods we created are only availabe to user we created not the mongoose User.
    const isPasswordValid = await user.isPasswordCorrect(password); // return boolean

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    //so we get the user from db. but with it we also got unwanted feilds
    //such as password and the we currently we have the refrence to the old user object
    //that had the refresh token = empty.
    // now we can do two things.
    //1. either update the object here with refresh token
    //2. or just make another database query to get the user.
    //now its on us if database query is expensive or not.

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");


    //to send cookies we need to set Options.
    //normally anyone can acces and modify the cookies from the frontend
    //but when we set httpOnly and secuer to true,
    //only server can modify the cookies.
    const options = {
        httpOnly: true,
        secure: true,
    }

    // why we are sending accessToken and refreshToken.
    // when we already have set it in the cookies?
    // beacuse what if user is trying to store it in localstorage 
    // or maybe he is building android app. There we cannot set cookies.
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, 
                accessToken, 
                refreshToken
            },
            "User logged in successfully"
        )
    )
});

const logoutUser = asyncHandler(async(req, res) => {
    //steps to logout user
    //1. to clear the cookies
    //2. remove the access and refresher token from the user object as well.
    
    //But we dont have access to user object.
    //now how wwe will do it ?
    //we can do it by using our own middleware 
    //using middleware we added the user object in the request object.
    //we can acces the user object from the request object.

    //we using findByIdAndUpdate instead of findById.
    //because we dont want to update the user after getting the user object and then save it etc..
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            //if we give this we get the updated user object in the response.
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jtw.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid  refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "RefreshToken is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user?._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    //steps to change current password
    //1. First get the suer email or password from frontend/req.body.
    //2. get the user from database by email or username.
    //3. NOT SURE, check for the authentication
    //4. check update the new password in the database and save it.
    const {oldPassword, newPassword} = req.body
    console.log(req.user, "Req. User data");

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password Changed successfully'));

});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current useer fetched successfully"));
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("password");

    //TODO: Delete Old Image - assignment

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    //steps to update user avatar
    //1. first get file path from the req.files
    //2. fetch the user from db
    //3. get the file local filepath of the avatar image
    //4. update the user with new avatart file 
    //5  upload it to cloudinary and saved that into the user object.

    //We used here file instead of files. 
    //Because we only taking one file to update it.
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400, "Error, while uploading on avartar");
    } 

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url 
            }
        }, 
        {new: true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));

});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    //steps to update user avatar
    //1. first get the file path from the req.files
    //2. fetch the user from db
    //3. get the file local filepath of the avatar image
    //4. update the user with new avatart file 
    //5  upload it to cloudinary and saved that into the user object.

    //We used here file instead of files. 
    //Because we only taking one file to update it.
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "cover Image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover Image");
    } 

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url 
            }
        }, 
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params;
    
    if(!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    //each object in aggregate is a stage
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
          $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false,
                }
            }
          }  
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,

            }
        }
    ])
    // what does aggregate return?

    if(!channel?.length) {
        throw new ApiError(404, "Channel does not exists");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async(req, res) => {
    // All aggregation goes directly to mongoDB,
    // when we get the user id from request (req.user._id) we get string. but when we do find or any other methods of mongoose.
    //  mongoose automatically converts mondoDB string into full mongoDB ID.
    // thats why here we have to convert the mongoDB id from string to full ID. 
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1, 
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                        //Todo: try to do the subpipeline. here from the lookup users pipleline.
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            } 
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully"));
});

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}