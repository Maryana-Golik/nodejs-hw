import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { createSession, setSessionCookies } from "../services/auth.js";
import { Session } from "../models/session.js";
import Handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from "node:path";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../utils/sendMail.js";




export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createHttpError(400, 'Email in use'));
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, password: hashedPassword });

  const session = await createSession(newUser._id);
  setSessionCookies(res, session);

  res.status(201).json(newUser);

};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res, next) => {
  const { sessionId } = req.cookies;

  if (!sessionId) {
    return res.status(204).send();
  }

  await Session.deleteOne({ _id: sessionId });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const refreshUserSession = async (req, res, next) => {

  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken
  });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired'));
  }

  await Session.deleteOne({ _id: req.cookies.sessionId });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: "Session refreshed" });
};

export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'Password reset email sent successfully' });
  }

  const resetToken = jwt.sign({
    sub: user._id, email: user.email
  },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  console.log(resetToken);


  const templatePath = path.join(process.cwd(), 'src', 'templates', 'reset-password-email.html');
  const templateContent = await fs.readFile(templatePath, 'utf-8');

  const template = Handlebars.compile(templateContent);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });


try {
  await sendEmail({
    to: email,
    subject: 'Reset your password!',
    from: process.env.SMTP_FROM,
    html,
  });
} catch (error) {
  console.error('SMTP ERROR:', error);
  throw createHttpError(500, 'Failed to send the email');
}
res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};


export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully'
  });
};




