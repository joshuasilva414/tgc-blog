import { defineTable, defineDb, column, sql, TRUE } from "astro:db";
import { nanoid } from "nanoid";

export const Posts = defineTable({
  columns: {
    id: column.text({ primaryKey: true, default: sql`${nanoid(6)}` }),
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
