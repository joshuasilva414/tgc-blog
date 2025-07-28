import type { Loader, LoaderContext } from "astro/loaders";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.CONTENT_BUCKET_ACCESS_KEY,
    secretAccessKey: import.meta.env.CONTENT_BUCKET_SECRET_KEY,
  },
});

const getPostContent = async (slug: string) => {
  const command = new GetObjectCommand({
    Bucket: import.meta.env.CONTENT_BUCKET_NAME,
    // Expect the object in R2 to be stored with a .md extension
    Key: `posts/${slug}.md`,
  });

  const response = await client.send(command);
  if (!response.Body) {
    throw new Error(`No object body returned for slug: ${slug}`);
  }

  const body = await streamToString(response.Body);

  // Strip frontmatter (YAML between --- lines at the top)
  const frontmatterRegex = /^---[\s\S]*?---\s*/;
  const strippedBody = body.replace(frontmatterRegex, "");

  return strippedBody;
};

const streamToString = async (stream: any): Promise<string> => {
  if (typeof stream?.text === "function") {
    return stream.text();
  }

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
};

export { getPostContent };
