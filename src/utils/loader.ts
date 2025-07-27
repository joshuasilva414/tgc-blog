import type { Loader, LoaderContext } from "astro/loaders";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { db, eq, FALSE, ne, Posts, TRUE } from "astro:db";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.CONTENT_BUCKET_ACCESS_KEY,
    secretAccessKey: import.meta.env.CONTENT_BUCKET_SECRET_KEY,
  },
});