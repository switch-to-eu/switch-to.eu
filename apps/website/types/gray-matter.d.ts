/* eslint-disable no-unused-vars */
// Type definition module for gray-matter - parameter names are documentation only
declare module 'gray-matter' {
  function matter(
    content: string,
    options?: {
      excerpt?: boolean;
      excerpt_separator?: string;
      engines?: Record<string, unknown>;
      language?: string;
      delimiters?: string[] | string;
    }
  ): {
    data: Record<string, unknown>;
    content: string;
    excerpt?: string;
    orig: string;
    language: string;
    matter: string;
    stringify: () => string;
  };

  export = matter;
}
/* eslint-enable no-unused-vars */