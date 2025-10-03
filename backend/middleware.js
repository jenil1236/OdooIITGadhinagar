export const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in to access this resource" });
  }
  next();
};
