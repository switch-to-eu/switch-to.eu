import { redirect } from "next/navigation";

export default function LocalizedAdminPage() {
  // Redirect to the main admin page
  redirect("/admin");
}
