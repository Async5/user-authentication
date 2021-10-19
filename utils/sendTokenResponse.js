import jwt from 'jsonwebtoken';

const sendTokenResponse = (res, statusCode, id) => {
  // Generate token
  const token = jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  // Cokkie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

export default sendTokenResponse;
