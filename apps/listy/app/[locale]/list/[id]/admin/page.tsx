"use client";

import { useParams } from "next/navigation";
import { ListView } from "@components/list-view";

export default function ListAdminPage() {
  const params = useParams();
  const listId = params.id as string;

  return <ListView listId={listId} isAdmin={true} />;
}
