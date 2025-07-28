/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {
    otherLocals: {
      test: string;
    };
  }
}

// Temporary declaration until @astropub/md ships its own types
declare module "@astropub/md" {
  import type { Component } from "astro";

  /**
   * Compile a markdown string to HTML. Returns the HTML string.
   */
  export function markdown(source: string): Promise<string>;

  /**
   * Same as `markdown()` but for short inline strings.
   */
  export namespace markdown {
    function inline(source: string): Promise<string>;
  }

  /**
   * Astro component wrapper that renders markdown.
   */
  export const Markdown: Component<{ of: string }> & {
    Inline: Component<{ of: string }>;
  };
}
