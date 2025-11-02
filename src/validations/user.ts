import * as yup from "yup";

// 🟢 Validation for user creation (registration)
export const createUserSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters"),
  family: yup
    .string()
    .required("Family name is required")
    .min(2, "Family name must be at least 2 characters")
    .max(255, "Family name must not exceed 255 characters"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must not exceed 100 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  phone: yup
    .string()
    .nullable()
    .matches(/^(\+98|0)(.+)$/, "Invalid phone number format"),
  isAdmin: yup.boolean().default(false),
});

// 🟡 Validation for user update
export const updateUserSchema = yup.object({
  name: yup.string().min(2).max(255),
  family: yup.string().min(2).max(255),
  username: yup.string().min(3).max(100),
  password: yup.string().min(6).max(100),
  phone: yup
    .string()
    .nullable()
    .matches(/^(\+98|0)?9\d{9}$/, "Invalid phone number format"),
  isAdmin: yup.boolean().nullable().default(false),
});
