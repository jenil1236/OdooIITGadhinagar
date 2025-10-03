import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import LocalStrategy from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MongoStore from "connect-mongo";
import User from "./models/user.js";
import { connectDB } from "./config/db.js";

import userRouter from "./routes/user.js";

//App setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Session store
const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
    console.error("Error in Mongo Session Store:", err);
});

// Session middleware
app.use(session({
    store,
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // If not found, fallback to email match
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // Link Google account to existing local account
                user.googleId = profile.id;
                await user.save();
            } else {
                // New user
                user = new User({
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    googleId: profile.id
                });
                await user.save();
            }
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Routes
app.use("/api", userRouter);

// DB connection and server start
connectDB()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });
