import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../config";

export const hasPassword = async (password:string) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};