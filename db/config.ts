import { defineTable, defineDb, column } from "astro:db";

export const Posts = defineTable({
  columns: {
    // Let the seed script generate the id instead of relying on a per-row SQL default
    id: column.text({ primaryKey: true }),
    title: column.text(),
    slug: column.text({ unique: true }),
    pubDate: column.date(),
    description: column.text(),
    author: column.text({ optional: false }),
    // image: column.json(),
    // tags: column.json(),
    draft: column.boolean(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Posts,
  },
});
