import express from 'express'
import {
    getCurrentUser,
    loginUser,
    registerUser,
    updatePassword,
    updateUserProfile
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post('/login', loginUser)

// PROTECTED ROUTES
userRouter.get("/me", authMiddleware, getCurrentUser)
userRouter.put("/profile", authMiddleware, updateUserProfile)
userRouter.put("/password", authMiddleware, updatePassword)

export default userRouter
