"use client";

import { useState } from 'react';
import { Check, Trash2, Timer, ChevronUp, ChevronDown, TimerOff, GripVertical } from 'lucide-react';
import { Button } from '@switch-to-eu/ui/components/button';
import { cn } from '@switch-to-eu/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  id: string;
  description: string;
  completed: boolean;
  pomodoros?: number;
  isActive?: boolean;
  onToggleComplete: () => void;
  onUpdate: (description: string) => void;
  onDelete: () => void;
  onSetActive?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showActiveButton?: boolean;
  showMoveButtons?: boolean;
}

export function TaskItem({
  id,
  description,
  completed,
  pomodoros = 0,
  isActive = false,
  onToggleComplete,
  onUpdate,
  onDelete,
  onSetActive,
  onMoveUp,
  onMoveDown,
  showActiveButton = true,
  showMoveButtons = true,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description);
  const t = useTranslations('pomodoro.tasks');

  // Set up sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    if (isEditing) {
      if (editValue.trim() && editValue.trim() !== description) {
        onUpdate(editValue.trim());
      } else {
        setEditValue(description);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    }
    if (e.key === 'Escape') {
      setEditValue(description);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        isActive
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm",
        completed && "opacity-60",
        isDragging && "shadow-lg scale-105 z-50 rotate-1 opacity-90"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleComplete}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          completed
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-green-400"
        )}
      >
        {completed && <Check className="w-3 h-3" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none text-gray-800"
            maxLength={200}
            autoFocus
          />
        ) : (
          <div
            onClick={() => !completed && setIsEditing(true)}
            className={cn(
              "cursor-pointer text-gray-800",
              completed && "line-through text-gray-500"
            )}
          >
            {description}
          </div>
        )}

        {pomodoros > 0 && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <Timer className="w-3 h-3" />
            {pomodoros} {pomodoros === 1 ? t('pomodoro') : t('pomodoros')}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!completed && showActiveButton && onSetActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSetActive}
            className={cn(
              "h-8 w-8 p-0",
              isActive
                ? "bg-blue-100 text-primary-color"
                : "text-gray-400 hover:text-primary-color hover:bg-blue-50"
            )}
            title={isActive ? t('deactivate') : t('setActive')}
          >
            {isActive ? <TimerOff className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
          </Button>
        )}

        {/* Drag Handle - Show instead of move buttons when drag and drop is enabled */}
        {!completed && !showMoveButtons && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            title={t('dragToReorder')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
        )}

        {/* Legacy move buttons - only show when explicitly enabled */}
        {showMoveButtons && onMoveUp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            title={t('actions.moveUp')}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}

        {showMoveButtons && onMoveDown && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            title={t('actions.moveDown')}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
          title={t('actions.deleteTask')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}