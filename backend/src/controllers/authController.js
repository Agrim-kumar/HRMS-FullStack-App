const jwt = require('jsonwebtoken');
const { Organisation, User, Log } = require('../models');

// Register new organisation
const register = async (req, res, next) => {
  try {
    const { orgName, adminName, email, password } = req.body;

    // Validation
    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create organisation
    const organisation = await Organisation.create({ name: orgName });

    // Create user
    const user = await User.create({
      organisation_id: organisation.id,
      email,
      password_hash: password, // Will be hashed by beforeCreate hook
      name: adminName
    });

    // Create log
    await Log.create({
      organisation_id: organisation.id,
      user_id: user.id,
      action: 'organisation_created',
      meta: { orgName, adminName, email }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, orgId: organisation.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Organisation created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organisationId: organisation.id,
        organisationName: organisation.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user with organisation
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Organisation }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create log
    await Log.create({
      organisation_id: user.organisation_id,
      user_id: user.id,
      action: 'user_login',
      meta: { email }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, orgId: user.organisation_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organisationId: user.organisation_id,
        organisationName: user.Organisation.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'user_logout',
      meta: { email: req.user.email }
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout };
