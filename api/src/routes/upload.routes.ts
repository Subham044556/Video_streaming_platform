import { Router } from "express";

import { createPresignedUpload } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/presigned-url",
  authenticate,
  createPresignedUpload
);

export default router;