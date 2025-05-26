import defaultLocale from "@/middleware";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/${defaultLocale}`);
}
