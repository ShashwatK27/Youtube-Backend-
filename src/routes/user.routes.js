import { Router } from "express";
import { getCurrentUser, getUserChannelProfile, getWatchHistory, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
import { ChangeOldPassword } from "../controllers/user.controller.js";


const router = Router();

// Test route
router.get("/test", (req, res) => {
  console.log("User routes test endpoint hit");
  res.json({ message: "User routes working!" });
});

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverimage",
      maxCount: 1
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, ChangeOldPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-details").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverimage"), updateCoverImage)

router.route("/c/username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)


export default router;