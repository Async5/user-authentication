import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendTokenResponse from '../utils/sendTokenResponse.js';
import hashPassword from '../utils/hashPassword.js';

// @desc        Get all users
// @route       GET /users
// @access      Private
export const getUsers = asyncHandler(async (req, res, next) => {
  // Get all users
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// @desc        Get me
// @route       GET /users/me
// @access      Private
export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// @desc        Logout
// @route       GET /users/logout
// @access      Private
export const logout = asyncHandler(async (req, res, next) => {
  // Cokkie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(200).cookie('token', 'none', options).json({
    success: true,
    user: {},
  });
});

// @desc        Register user
// @route       POST /users/register
// @access      Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, password2 } = req.body;

  // Confirm password match
  if (password !== password2) {
    return next(
      new ErrorResponse('Password confirmation does not match password', 400)
    );
  }

  const cryptedPassword = hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    password: cryptedPassword,
  });

  sendTokenResponse(res, 200, user.id);
});

// @desc        login user
// @route       POST /users/login
// @access      Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Find user by email
  const user = await User.findOne({ email: email }).select('+password');

  // Check user exists
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));

  // Verify user password
  const verifyPassword = bcrypt.compareSync(password, user.password);

  // Checking verified user password
  if (!verifyPassword) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(res, 200, user.id);
});

// @desc        Delete user by id
// @route       DELETE /users/:id
// @access      Private
export const deleteUser = asyncHandler(async (req, res, next) => {
  // Find user by id and delete
  const user = await User.findByIdAndDelete(req.params.id);

  // Check user exists
  if (!user) return next(new ErrorResponse('There is no user with this id'));

  res.status(200).json({
    success: true,
    user: {},
  });
});

// @desc        Update user details
// @route       UPDATE /users/
// @access      Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  // Find user by id and update details
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user: user,
  });
});

// @desc        Change password
// @route       POST /users/password
// @access      Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { passwordOld, password, password1 } = req.body;

  // get user
  const user = await User.findById(req.user.id).select('+password');

  // Verify user password
  const verifyPassword = bcrypt.compareSync(passwordOld, user.password);

  if (!verifyPassword)
    return next(new ErrorResponse('password is incorrect', 400));

  // Confirm password
  if (password !== password1)
    return new ErrorResponse(
      'Password confirmation does not match password',
      400
    );

  const cryptedPassword = hashPassword(password);

  // Find user by id and change password
  await User.findByIdAndUpdate(
    req.user.id,
    { password: cryptedPassword },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    user: {},
  });
});
