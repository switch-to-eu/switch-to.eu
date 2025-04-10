declare module 'gray-matter' {
  function matter(
    content: string,
    options?: {
      excerpt?: boolean;
      excerpt_separator?: string;
      engines?: Record<string, any>;
      language?: string;
      delimiters?: string[] | string;
    }
  ): {
    data: Record<string, any>;
    content: string;
    excerpt?: string;
    orig: string;
    language: string;
    matter: string;
    stringify: () => string;
  };

  export = matter;
}