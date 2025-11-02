// routes/auth.routes.ts
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../models/user"; // adjust to your model export
import { validate } from "../middlewares/validate";
import { loginSchema } from "../validations/auth";
import { createUserSchema } from "../validations/user";
import { ACCESS_EXPIRES, JWT_REFRESH_SECRET, JWT_SECRET, REFRESH_EXPIRES, SALT_ROUNDS } from "../config";


const authRouter = express.Router();


function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}
function generateRefreshToken(payload: object) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

/**
 * POST /auth/register
 * Create user, produce tokens, set refresh cookie and return access token in body
 */
authRouter.post(
  "/register",
  validate(createUserSchema),
    async (req: Request, res: Response) => {
      console.log(req.body);
    try {
      const { username, password, name, family, phone, isAdmin } = req.body;

      // Safe parameterized query with Sequelize
      const existing = await(User as any).findOne({ where: { username } });
      if (existing)
        return res.status(400).json({ message: "Username already exists" });

      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashed = await bcrypt.hash(password, salt);

      const user = await(User).create({
        username,
        name,
        family,
        phone,
        password: hashed,
        isAdmin: false,
      });
      // payload (keep it small)
      const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // store refreshToken in DB (simple demo) — production: consider hashing refresh token
      await user.update({ refreshToken });

      // set refresh token in httpOnly cookie — not accessible from JS
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in prod (https)
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const userJson = user.toJSON();
      delete userJson.password;
      delete userJson.refreshToken;

      return res
        .status(201)
        .json({ message: "User created", user: userJson, accessToken });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: "Failed to register", error: err.message });
    }
  }
);

/**
 * POST /auth/login
 * Verify credentials, issue tokens, set refresh cookie, return access token
 */
authRouter.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response) => {
    try {
      console.log('Loign')
      const { username, password } = req.body;

      const user = await (User as any).findOne({ where: { username } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

      const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // store refreshToken in DB (demo)
      await user.update({ refreshToken });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userJson = user.toJSON();
      delete userJson.password;
      delete userJson.refreshToken;

      return res.json({
        message: "Login successful",
        user: userJson,
        accessToken,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: "Failed to login", error: err.message });
    }
  }
);

/**
 * POST /auth/refresh
 * Read refresh token from cookie (or body), validate, issue new access token (and optionally rotate refresh token)
 */
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    // try read from cookie first (recommended)
    const refreshToken = req.cookies?.refreshToken ?? req.body.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    // verify token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    } catch (e) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // check DB for same refresh token (prevent reuse if token was invalidated)
    const user = await (User as any).findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    // issue new access token (optionally rotate refresh token)
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    const newAccessToken = generateAccessToken(payload);

    // OPTIONAL: rotate refresh token to a new one
    const newRefreshToken = generateRefreshToken(payload);
    await user.update({ refreshToken: newRefreshToken });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Failed to refresh token", error: err.message });
  }
});

/**
 * POST /auth/logout
 * Invalidate refresh token (remove from DB) and clear cookie
 */
authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
        const user = await (User as any).findByPk(decoded.id);
        if (user) {
          await user.update({ refreshToken: null });
        }
      } catch {
        // ignore
      }
    }

    // clear cookie
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Failed to logout", error: err.message });
  }
});

export default authRouter;
