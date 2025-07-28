import { asDrizzleTable } from "@astrojs/db/utils";
import type { LoaderContext } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { db } from "astro:db";
import { Posts } from "../db/config";
import { eq } from "astro:db";
import { FALSE } from "astro:db";

type Post = {
  id: string;
  title: string;
  slug: string;
  pubDate: Date;
  description: string;
  author: string;
  draft: boolean;
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
      .where(() => eq(typeSafePosts.draft, FALSE));

    return selectedPosts.map((p) => ({ ...p, id: p.slug }));
  },
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    // image: z.object({
    //   url: z.string(),
    //   alt: z.string(),
    // }),
    tags: z.array(z.string()),
    draft: z.boolean(),
  }),
});

export const collections = {
  Posts: posts,
};
