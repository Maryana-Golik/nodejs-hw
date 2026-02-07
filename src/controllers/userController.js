import User from '../models/user.js';
import createHttpError from 'http-errors';

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'Avatar file is required');
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl },
    { new: true }
  );

  res.status(200).json({
    message: 'Avatar updated successfully',
    avatarUrl,
  });
};
