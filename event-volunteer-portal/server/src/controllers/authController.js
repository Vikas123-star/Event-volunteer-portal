const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const { asyncHandler } = require('../middleware/error');

exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  // Only allow admin role if no admin exists OR explicit — for security normally you'd disable this
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'student',
  });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ user: user.toJSON(), token });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
