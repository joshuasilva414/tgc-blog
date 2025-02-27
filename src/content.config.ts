import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "posts" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
};
