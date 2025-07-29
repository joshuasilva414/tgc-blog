declare module "gray-matter" {
  // Minimal subset needed for this project
  export interface GrayMatterFile<T> {
    data: T;
    content: string;
  }

  export default function matter<T = any>(input: string): GrayMatterFile<T>;
}
