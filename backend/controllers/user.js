import User from "../models/user.js";
import Otp from "../models/otp.js";
import { sendOTP, sendPassword } from "../utils/sendMail.js";
import company from "../models/company.js";
// Signup controller
import generator from "generate-password";
import passport from "passport";

// Generate random password utility
const generateRandomPassword = () => {
  return generator.generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true
  });
};

// -----------------------------
// Signup Controller (with email login)
// -----------------------------

export const Signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword, 
      country,
      companyname,
      currency
    } = req.body;

    if (!name || !email || !password || !confirmpassword || !country || !companyname || !currency) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const companyExists = await company.findOne({ name: companyname });
    if (companyExists) {
      return res.status(400).json({ message: "Company name already exists" });
    }

    const newCompany = new company({ name: companyname, country, baseCurrency: currency });
    await newCompany.save();

    // ✅ Create user WITHOUT password field
    const newUser = new User({
      name,
      email,
      country,
      companyId: newCompany._id,
      role: 'Admin'
    });

    // ✅ Register the user and hash the password
    const registeredUser = await User.register(newUser, password);

    // Optional: auto-login after signup
    req.login(registeredUser, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: registeredUser._id,
          email: registeredUser.email,
          name: registeredUser.name,
          role: registeredUser.role,
          companyId: registeredUser.companyId
        }
      });
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Error registering user" });
  }
};

export const advancedSignup = async (req, res) => {
  try {
    const { name, email, role, managerId } = req.body;

    // Generate random password
    const randomPassword = generateRandomPassword();

    // Create new user (note: username is optional here)
    const newUser = new User({
      name,
      email,
      companyId : req.user.companyId, // from logged-in admin
      role,
      country : req.user.country,
      managerId: managerId || null
     
    });

    // Register (password gets hashed automatically)
    const registeredUser = await User.register(newUser, randomPassword);
    await sendPassword(email, randomPassword);

    // Auto-login after signup
    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(200).json({
        message: "Welcome to Odoo! Your account has been created.",
        user: {
          id: registeredUser._id,
          email: registeredUser.email,
          role: registeredUser.role,
          companyId: registeredUser.companyId,
          country: registeredUser.country,
        },
        password: randomPassword // return once for admin/user
      });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// -----------------------------
// Login Controller (email-based)
// -----------------------------
export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || "Invalid credentials" });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          country: user.country,
        }
      });
    });
  })(req, res, next);
};

// -----------------------------
// Logout Controller
// -----------------------------
export const logout = (req, res, next) => {
  console.log(req.user);
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "You are logged out!" });
  });
};




export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp });
  await sendOTP(email, otp);
  res.json({ message: "OTP sent to email" });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });
  res.json({ message: "OTP verified" });
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use passport-local-mongoose's setPassword
    await new Promise((resolve, reject) => {
      user.setPassword(newPassword, (err, updatedUser) => {
        if (err) reject(err);
        else resolve(updatedUser);
      });
    });

    await user.save();

    // Clean up OTPs
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

