import { defineCollection, z } from "astro:content";
import { getAllPostMetadata } from "./utils/s3";

type Post = {
  id: string;
  title: string;
  slug: string;
  pubDate: Date;
  description: string;
  author: string;
  draft: boolean;
  tags: string[];
};

const posts = defineCollection({
  loader: async (): Promise<Post[]> => {
    const posts = await getAllPostMetadata();
    // Filter out drafts and assert type
    return posts.filter((p) => !p.draft) as Post[];
  },
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean(),
  }),
});

export const collections = {
  Posts: posts,
};
