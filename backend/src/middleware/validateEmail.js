// src/middleware/validateEmail.js
import { body, validationResult } from "express-validator";

/**
 * Middleware — validates that the email in req.body is:
 *   1. Present
 *   2. A valid email format
 *
 * On failure → returns 400 with a clear message.
 * On success → calls next().
 */
export const validateWorkEmail = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required to generate your audit report.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: "EMAIL_INVALID",
      });
    }
    next();
  },
];
