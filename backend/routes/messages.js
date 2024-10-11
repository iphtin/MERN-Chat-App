import express from "express";
import { getAllMessage, createGroup } from "../controllers/messages.js";

const router = express.Router();

router.post("/getmsg", getAllMessage);
router.post("/group/", createGroup);

export default router;