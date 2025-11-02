import * as dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
dotenv.config({
  path: "${__dirname}/../.env",
});
export const API_PORT = Number(process.env.API_PORT);
export const DB_HOST = String(process.env.DB_HOST);
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_NAME = String(process.env.DB_NAME);
export const DB_USER = String(process.env.DB_USER);
export const DB_PASSWORD = String(process.env.DB_PASSWORD);

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || "change_this";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "change_this_refresh";
export const ACCESS_EXPIRES = (process.env.JWT_EXPIRES_IN ||
  "15m") as SignOptions["expiresIn"];
export const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];
export const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

// Super User
export const SUPERUSER_USERNAME = process.env.SUPERUSER_USERNAME || "admin";
export const SUPERUSER_PASSWORD = process.env.SUPERUSER_PASSWORD || "admin";