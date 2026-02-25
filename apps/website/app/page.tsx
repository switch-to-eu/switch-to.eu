import { routing } from "@switch-to-eu/i18n/routing";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/${routing.defaultLocale}`);
}
