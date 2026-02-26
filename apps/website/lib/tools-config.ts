const isDev = process.env.NODE_ENV === "development";

type Tool = {
  id: string;
  href: string;
  /** i18n key under "tools.items.<id>" */
  i18nKey: string;
};

export const tools: Tool[] = [
  {
    id: "website-tool",
    href: isDev ? "https://website.switch-to.test" : "https://website.switch-to.eu",
    i18nKey: "websiteTool",
  },
  {
    id: "keepfocus",
    href: isDev
      ? "https://focus.switch-to.test"
      : "https://focus.switch-to.eu",
    i18nKey: "keepfocus",
  },
  {
    id: "plotty",
    href: isDev ? "https://poll.switch-to.test" : "https://poll.switch-to.eu",
    i18nKey: "plotty",
  },
  {
    id: "listy",
    href: isDev ? "https://list.switch-to.test" : "https://list.switch-to.eu",
    i18nKey: "listy",
  },
];
