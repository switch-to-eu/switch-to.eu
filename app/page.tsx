import { redirect } from "@/i18n/navigation";
import defaultLocale from "@/middleware";

export default function Home() {
  redirect(`/${defaultLocale}`);
}
