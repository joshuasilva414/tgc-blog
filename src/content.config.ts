import type { LoaderContext } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { Posts, db } from "astro:db";
import { eq } from "astro:db";
import { FALSE } from "astro:db";

const posts = defineCollection({
  loader: async () => {
    const selectedPosts = await db
      .select({
        id: Posts.id,
        title: Posts.title,
        slug: Posts.slug,
        pubDate: Posts.pubDate,
        description: Posts.description,
        author: Posts.author,
        draft: Posts.draft,
      })
      .from(Posts)
      .where(() => eq(Posts.draft, FALSE));

    return selectedPosts;
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
    // tags: z.array(z.string()),
    draft: z.boolean(),
  }),
});

export const collections = {
  Posts: posts,
};
