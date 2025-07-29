import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import matter from "gray-matter";

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
  // Case 1: body has a .text() method (Blob, Response, etc.)
  if (typeof stream?.text === "function") {
    return stream.text();
  }

  // Case 2: Web standard ReadableStream
  if (typeof stream?.getReader === "function") {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    return result;
  }

  // Case 3: Async iterable (Node.js Readable)
  if (Symbol.asyncIterator in Object(stream)) {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
  }

  // Case 4: EventEmitter style (legacy Node streams)
  if (typeof stream?.on === "function") {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      stream.on("error", reject);
    });
  }

  throw new Error("Unsupported stream type returned from S3 client");
};

// Add helper to list all post slugs stored under the `posts/` prefix
const listAllPostSlugs = async (): Promise<string[]> => {
  const listCommand = new ListObjectsV2Command({
    Bucket: import.meta.env.CONTENT_BUCKET_NAME,
    Prefix: "posts/",
  });

  const listResponse = await client.send(listCommand);
  const keys = listResponse.Contents?.map((item) => item.Key).filter(
    Boolean
  ) as string[];

  // Transform keys like `posts/my-post.md` into slugs like `my-post`
  return keys.map((key) => key.replace(/^posts\//, "").replace(/\.md$/, ""));
};

// Fetch a single post's metadata (frontmatter) from R2
const getPostMetadata = async (slug: string) => {
  const command = new GetObjectCommand({
    Bucket: import.meta.env.CONTENT_BUCKET_NAME,
    Key: `posts/${slug}.md`,
  });

  const response = await client.send(command);
  if (!response.Body) {
    throw new Error(`No object body returned for slug: ${slug}`);
  }

  const raw = await streamToString(response.Body);
  const { data } = matter(raw);

  // Ensure required fields exist; consumers will handle validation
  return {
    id: slug,
    slug,
    title: data.title as string,
    pubDate: new Date(data.pubDate ?? data.date ?? Date.now()),
    description: data.description as string,
    author: data.author as string,
    draft: Boolean(data.draft),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  } as const;
};

// Load all post metadata objects in parallel
const getAllPostMetadata = async () => {
  const slugs = await listAllPostSlugs();
  return Promise.all(slugs.map((slug) => getPostMetadata(slug)));
};

export { getPostContent, getAllPostMetadata };
