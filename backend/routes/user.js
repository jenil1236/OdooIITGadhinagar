// import express from "express";
// import passport from "passport";
// import { signup, login, logout } from "../controllers/user.js";

// const router = express.Router();

// // POST /signup
// router.post("/signup", signup);


// // POST /login
// router.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) return next(err);
//     if (!user) {
//       return res.status(401).json({ error: info.message || "Invalid credentials" });
//     }
//     req.login(user, (err) => {
//       if (err) return next(err);
//       return res.status(200).json({
//         message: "Login successful",
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email
//         }
//       });
//     });
//   })(req, res, next);
// });

// // POST /logout
// router.post("/logout", logout);

// // Google login
// router.get("/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login", session: true }),
//   (req, res) => {
//     // At this point, req.user is set by Passport
//     const user = req.user;

//     res.status(200).json({
//       message: "Google login successful",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email
//       }
//     });
//   }
// );

// export default router;

import express from "express";
import passport from "passport";
import { signup, login, logout, advancedSignup, forgotPassword, verifyOtp, resetPassword } from "../controllers/user.js";

const router = express.Router();

// POST /signup
router.post("/signup", signup);

// POST /register
router.post("/register", advancedSignup);

// POST /login
router.post("/login", login);

// POST /logout
router.post("/logout", logout);

// POST /forgot-password
router.post("/forgot-password", forgotPassword);

// POST /verify-otp
router.post("/verify-otp", verifyOtp);

// POST /reset-password
router.post("/reset-password", resetPassword);

// Google login
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    // At this point, req.user is set by Passport
    const user = req.user;

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }
);

export default router;