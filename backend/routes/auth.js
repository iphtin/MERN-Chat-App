import express from "express";
import { register, loggedIn } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", loggedIn);
router.post("/register", register);

export default router;