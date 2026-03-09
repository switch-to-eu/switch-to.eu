"use client";

import { use } from "react";
import { BoardView } from "@components/board-view";

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <BoardView boardId={id} />;
}
