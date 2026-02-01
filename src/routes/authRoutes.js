import { Router } from "express";
import { loginUser, logoutUser, refreshUserSession, registerUser } from "../controllers/authController.js";
import { celebrate } from "celebrate";
import { loginUserSchema, registerUserSchema } from "../validations/authValidation.js";

const authRouter = Router();

authRouter.post('/auth/register', celebrate(registerUserSchema), registerUser);

authRouter.post('/auth/login', celebrate(loginUserSchema), loginUser);

authRouter.post('/auth/logout', logoutUser);

authRouter.post('/auth/refresh', refreshUserSession);

export default authRouter;

