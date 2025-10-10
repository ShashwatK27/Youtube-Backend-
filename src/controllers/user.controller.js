import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadFFileOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req,res)=>{
  //get data from user
  //go to db
  //check if user already exist
  //if yes, redirect to sign in,
  //else create a new user field in db
  //send response to user that user is registered successfully

  const {fullname, email,username,password} = req.body
  console.log("email:",email);

  if([fullname,email,username,password].some((field)=>field?.trim() === ""))
    {
    throw new ApiError(400,"All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{username},{email}]
  })

  if(existedUser){
    throw new ApiError(409,"User already exist, please sign in")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath= req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
    coverImageLocalPath=req.files.coverimage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
  }

  const avatar=await uploadFFileOnCloudinary(avatarLocalPath);
  const coverImage=await uploadFFileOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400,"Avatar is required")
  }

  const user= await User.create({
    fullname,
    email,
    username,
    password,
    avatar: avatar.url,
    coverimage: coverImage?.url
  })

  const createdUser =await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500, "User registration failed, please try again later")
  }

  return res.status(201).json(new ApiResponse( 201, createdUser, "User registered successfully"))

})



export {registerUser};