import express from "express"
import { getAllUser, getUser, updateUser, getUserContacts } from "../controllers/users.js";

const router = express.Router();

router.get("/:id", getUser);
router.get("/", getAllUser);
router.put("/update/:id", updateUser);
router.get('/contacts/:id', getUserContacts);

export default router;