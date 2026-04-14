exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate field value" });
  }

  res.status(500).json({ success: false, message: "Server error" });
};