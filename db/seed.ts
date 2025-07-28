import { asDrizzleTable } from "@astrojs/db/utils";
import { db } from "astro:db";
import { nanoid } from "nanoid";
import { Posts } from "./config";

// https://astro.build/db/seed
export default async function seed() {
  const typeSafePosts = asDrizzleTable("Posts", Posts);
  // Remove the 'id' property from the inserted objects, as the Posts table likely auto-generates it.
  const posts = await db
    .insert(typeSafePosts)
    .values({
      title: "Hello, World!",
      slug: "hello-world",
      pubDate: new Date("2024-07-06"),
      description:
        "This is the first post of my new Astro blog entitled 'The Garbage Collection'.",
      author: "Joshua Silva",
      //   image: {
      //     url: "https://docs.astro.build/assets/rose.webp",
      //     alt: "The Astro logo on a dark background with a pink glow.",
      //   },
      tags: ["learning-in-public"],
      draft: false,
    })
    .returning();

  console.log(posts);
}
