import { asDrizzleTable } from "@astrojs/db/utils";
import { defineCollection, z } from "astro:content";
import { db } from "astro:db";
import { Posts } from "../db/config";
import { eq } from "astro:db";

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
    const typeSafePosts = asDrizzleTable("Posts", Posts);
    const selectedPosts = await db
      .select({
        title: typeSafePosts.title,
        slug: typeSafePosts.slug,
        pubDate: typeSafePosts.pubDate,
        description: typeSafePosts.description,
        author: typeSafePosts.author,
        draft: typeSafePosts.draft,
        tags: typeSafePosts.tags,
      })
      .from(typeSafePosts)
      .where(() => eq(typeSafePosts.draft, false));

    return selectedPosts.map((p) => ({
      ...p,
      id: p.slug,
      tags: p.tags as string[],
    }));
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
