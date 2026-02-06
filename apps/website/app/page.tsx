import defaultLocale from "@/proxy";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/${defaultLocale}`);
}
