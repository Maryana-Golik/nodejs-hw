import { Router } from "express";
import { loginUser, logoutUser, refreshUserSession, registerUser, requestResetEmail, resetPassword } from "../controllers/authController.js";
import { celebrate } from "celebrate";
import { loginUserSchema, registerUserSchema, requestResetEmailSchema, resetPasswordSchema } from "../validations/authValidation.js";

const authRouter = Router();

authRouter.post('/auth/register', celebrate(registerUserSchema), registerUser);

authRouter.post('/auth/login', celebrate(loginUserSchema), loginUser);

authRouter.post('/auth/logout', logoutUser);

authRouter.post('/auth/refresh', refreshUserSession);

authRouter.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);

authRouter.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);
export default authRouter;


