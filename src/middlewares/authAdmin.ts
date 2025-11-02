import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This middleware checks if user is admin
export const checkIsAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log(decoded);
    // Check admin flag
    if (!decoded.isAdmin)
      return res.status(403).json({ message: "Access denied, admin only" });

    // Pass user info to next middleware
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
