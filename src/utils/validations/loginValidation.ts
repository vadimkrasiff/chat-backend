import { isEmail } from "validator";
import { check } from "express-validator";

const loginValidation = [
  check("email").isEmail(),
  check("password").isLength({ min: 3 }),
];

export default loginValidation;
