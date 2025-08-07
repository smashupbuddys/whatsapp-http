const express = require("express");
const router = express.Router();

import authRouter from "./auth";
import messageRouter from "./message";

router.use("/auth", authRouter);
router.use("/message", messageRouter);

export default router;
