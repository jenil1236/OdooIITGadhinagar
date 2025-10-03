import User from "../models/user.js";

// Signup controller
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // Log in user
    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ 
        message: "Welcome to Odoo!", 
        user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email } 
      });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login controller
export const login = (req, res) => {
  const user = req.user; // Passport sets this after successful login

  res.status(200).json({ 
    message: "Welcome back to Odoo!", 
    user: { id: user._id, username: user.username, email: user.email },
    redirectUrl
  });
};

// Logout controller
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "You are logged out!" });
  });
};
