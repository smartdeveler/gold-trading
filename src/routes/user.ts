import type { Request, Response } from "express";
import express from "express";
import User from "../models/user";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../validations/user";
import { checkIsAdmin } from "../middlewares/authAdmin";
import { hasPassword } from "../utils/hashPassword";
const userRouter = express.Router();

// Create a new user
userRouter.post(
  "/",
  validate(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, family, username, password, phone, isAdmin } = req.body;
      const existing = await User.findOne({ where: { username } });
      if (existing)
        return res.status(400).json({ message: "Username already exists" });
      const hashedPassword = await hasPassword(password)

      const user = await User.create({
        ...req.body,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User created successfully", user });
      user;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Get all users
userRouter.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Get user by ID
userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user." });
  }
});

// Update user by ID
userRouter.put(
  "/:id",
  validate(updateUserSchema),
  async (req:Request, res:Response) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Re-hash password if updated
      if (req.body.password) {
        req.body.password = await hasPassword(req.body.password)
      }
      const {isAdmin,username,...rest} = req.body;
      const newUser=await user.update(rest);
      res.json({ message: "User updated successfully", newUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete user by ID
userRouter.delete("/:id",checkIsAdmin, async (req: Request, res: Response) => {
  try {
    const deletedRowsCount = await User.destroy({
      where: { id: req.params.id },
    });
    if (deletedRowsCount === 0) {
      res.status(404).json({ message: "User not found." });
    } else {
      res.json({ message: "User deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// Superuser can promote/demote users
userRouter.patch("/set-admin/:id", checkIsAdmin, async (req:Request, res:Response) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isAdmin = isAdmin;
    await user.save();

    res.json({
      message: `User ${user.username} is now ${
        isAdmin ? "an admin" : "a regular user"
      }`,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default userRouter;
