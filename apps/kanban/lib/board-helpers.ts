import type { BoardData } from "react-kanban-kit";
import type { DecryptedCardData } from "@/lib/types";

export interface DecryptedColumn {
  id: string;
  title: string;
  color?: string;
  cards: DecryptedCardData[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedBoard {
  id: string;
  title: string;
  description?: string;
  columnOrder: string[];
  createdAt: string;
  expiresAt: string;
  version: number;
  columns: DecryptedColumn[];
}

/**
 * Convert our decrypted board state into react-kanban-kit's BoardData format.
 */
export function toBoardData(board: DecryptedBoard): BoardData {
  const data: BoardData = {
    root: {
      id: "root",
      title: board.title,
      parentId: null,
      children: board.columnOrder,
      totalChildrenCount: board.columnOrder.length,
    },
  };

  for (const col of board.columns) {
    const cardIds = col.cards.map((c) => c.id);
    data[col.id] = {
      id: col.id,
      title: col.title,
      parentId: "root",
      children: cardIds,
      totalChildrenCount: cardIds.length,
      content: { color: col.color },
    };

    for (const card of col.cards) {
      data[card.id] = {
        id: card.id,
        title: card.title,
        parentId: col.id,
        children: [],
        totalChildrenCount: 0,
        type: "card",
        content: {
          id: card.id,
          title: card.title,
          description: card.description,
          labels: card.labels,
          dueDate: card.dueDate,
        } satisfies DecryptedCardData,
      };
    }
  }

  return data;
}
