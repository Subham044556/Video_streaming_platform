import { prisma } from "./config/db.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Video Streaming API is running",
  });
});
app.use("/upload", uploadRoutes);

export default app; 