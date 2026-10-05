import type { Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { z } from "zod";

import { prisma } from "../config/db.js";
import { s3Client, S3_BUCKET } from "../config/s3.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const createPresignedUpload = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = uploadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid upload data",
      });
    }

    const {
      filename,
      contentType,
      title,
      description,
    } = result.data;

    const extension = filename.includes(".")
      ? filename.substring(filename.lastIndexOf("."))
      : "";

    const rawS3Key = `raw/${req.user.userId}/${randomUUID()}${extension}`;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        rawS3Key,
        userId: req.user.userId,
      },
    });

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: rawS3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(
      s3Client,
      command,
      {
        expiresIn: 900,
      }
    );

    return res.status(201).json({
      message: "Presigned upload URL created",
      video: {
        id: video.id,
        title: video.title,
        status: video.status,
      },
      uploadUrl,
      key: rawS3Key,
    });
  } catch (error) {
    console.error("Presigned upload error:", error);

    return res.status(500).json({
      message: "Could not create upload URL",
    });
  }
};