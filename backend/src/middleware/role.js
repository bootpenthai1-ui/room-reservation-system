function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" });
    }
    next();
  };
}

module.exports = { authorize };
