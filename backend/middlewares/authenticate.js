const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied! No token provided." });
    }

    try {
        // Handle both formats: "Bearer <token>" and just "<token>"
        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authenticate;
