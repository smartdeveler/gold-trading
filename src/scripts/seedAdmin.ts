import bcrypt from "bcrypt";
import User from "../models/user";
import { SUPERUSER_PASSWORD, SUPERUSER_USERNAME } from "../config";
import db from '../db'
async function createAdmin() {
  await db.sync(); // 🟢 ساخت همه جداول از مدل‌ها (در صورت نبود)

  const username = SUPERUSER_USERNAME;
  const password = SUPERUSER_PASSWORD;
  const name = "Super";
  const family = "Admin";

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    console.log("✅ Admin user already exists.");
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hashed,
    name,
    family,
    isAdmin: true,
  });

  console.log("🚀 Super user created successfully!");
}

createAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
