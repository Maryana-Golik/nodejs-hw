import createError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (createError.isHttpError(err)) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: 'Internal server error',
  });
};
