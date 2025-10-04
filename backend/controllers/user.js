import User from "../models/user.js";
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
export const signup = async (req, res) => {
  try {
    const { email, companyId, role, country, managerId, approvalFlow, isManagerApprover } = req.body;

    // Generate random password
    const randomPassword = generateRandomPassword();

    // Create new user (note: username is optional here)
    const newUser = new User({
      email,
      companyId,
      role,
      country,
      managerId: managerId || null,
      approvalFlow: approvalFlow || [],
      isManagerApprover: isManagerApprover || false,
    });

    // Register (password gets hashed automatically)
    const registeredUser = await User.register(newUser, randomPassword);

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
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "You are logged out!" });
  });
};
