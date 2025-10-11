import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user =await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}


const registerUser = asyncHandler(async (req, res) => {
  console.log("Request received at /register endpoint");
  const { fullname, email, username, password } = req.body;
  console.log("REQ BODY:", req.body);
  console.log("REQ FILES:", req.files);

  if ([fullname, email, username, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists, please sign in");
  }

  console.log("REQ FILES:", req.files);

  console.log("Files received:", req.files);
  
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  console.log("Avatar path:", avatarLocalPath);
  
  let coverImageLocalPath;
  if (req.files?.coverimage?.length > 0) {
    coverImageLocalPath = req.files.coverimage[0].path;
  }
  console.log("Cover image path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadFileOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullname,
    email,
    username,
    password,
    avatar: avatar.url,
    coverimage: coverImage?.url || ""
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User registration failed, please try again later");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email ,password} = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email are required");
  }

  const user=await User.findOne({
    $or: [{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User not found, please register");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid credentials, please try again");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

  const options={
    httponly:true,
    secure: true
  }



  return res.status(200).
  cookie("refreshToken",refreshToken,options).
  cookie("accessToken",accessToken,options).
  json(
    new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
  );
 
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {refreshToken: undefined}
    },
    {
      new: true
    }
  )

  const options={
    httponly:true,
    secure: true
  }
  return res.status(200).
  clearCookie("refreshToken",options).
  clearCookie("accessToken",options).
  json(
    new ApiResponse(200, {}, "Logout successful")
  );

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookiess.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }

try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user= await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Unauthorized request");
    }
  
    const options={
      httponly: true,
      secure:true
    }
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    return res.status(200).
    cookie("refreshToken",newRefreshToken,options).
    cookie("accessToken",accessToken,options).
    json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully")
    );
} catch (error) {
  throw new ApiError(401,error?.message || "Unauthorized request");
}
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };
