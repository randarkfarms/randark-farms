import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema } from '../utils/validators';
import { AuthRequest } from '../types';

// @desc    Register admin (only first time setup)
// @route   POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body);
  const { name, email, password } = parsed;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  const token = generateToken({ id: user._id.toString(), email: user.email, name: user.name });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// @desc    Login admin
// @route   POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const { email, password } = parsed;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user._id.toString(), email: user.email, name: user.name });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.user?.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc    Logout (optional, since JWT stateless)
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});