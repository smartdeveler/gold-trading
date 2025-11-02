import type { Request, Response, NextFunction } from "express";
import type { AnyObjectSchema } from "yup";

// Generic Yup validation middleware
export const validate =
  (schema: AnyObjectSchema) =>
      async (req: Request, res: Response, next: NextFunction) => {
      console.log("validate");
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false, // collect all validation errors
        stripUnknown: true, // remove extra fields not defined in schema
      });
      
      next();
    } catch (err: any) {
      console.log(err.errors);

      res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
  };
