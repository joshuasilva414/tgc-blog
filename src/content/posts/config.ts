import { z, defineCollection } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    slug: z.string(),
    pubDate: z.date(),
    author: z.string(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      }) // optional image displayed at the top of the post (under title, author, and publish date)
      .optional(), // optional image
    tags: z.array(z.string()).optional(), // article categories
    related: z.array(z.string()).optional(), // slugs of related articles
  }),
});

export const collections = {
  posts: postsCollection,
};
