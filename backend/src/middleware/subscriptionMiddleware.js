export const allowSubscriptions = (...allowedSubscriptions) => (req, res, next) => {
  if (!req.user || !allowedSubscriptions.includes(req.user.subscription)) {
    return res.status(403).json({ message: "Subscription plan does not allow this action" });
  }
  next();
};
