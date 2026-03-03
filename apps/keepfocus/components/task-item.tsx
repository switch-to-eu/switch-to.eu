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
        "group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
        isActive
          ? "bg-brand-navy/5 border-brand-navy/15"
          : "bg-white border-border/60 hover:border-brand-navy/20",
        completed && "opacity-50",
        isDragging && "scale-105 z-50 rotate-1 opacity-90"
      )}
    >
      {/* Circle Checkbox */}
      <button
        onClick={onToggleComplete}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
          completed
            ? "bg-brand-yellow border-brand-yellow text-brand-navy"
            : "border-brand-navy/30 hover:border-brand-navy"
        )}
      >
        {completed && <Check className="w-3 h-3" strokeWidth={3} />}
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
            className="w-full bg-transparent border-none outline-none text-foreground"
            maxLength={200}
            autoFocus
          />
        ) : (
          <div
            onClick={() => !completed && setIsEditing(true)}
            className={cn(
              "cursor-pointer text-foreground text-sm",
              completed && "line-through text-muted-foreground"
            )}
          >
            {description}
          </div>
        )}

        {pomodoros > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center gap-1 bg-brand-sky/10 text-brand-navy rounded-full px-2 py-0.5 text-xs">
              <Timer className="w-3 h-3" />
              {pomodoros} {pomodoros === 1 ? t('pomodoro') : t('pomodoros')}
            </span>
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
              "h-7 w-7 p-0 rounded-full",
              isActive
                ? "bg-brand-navy/10 text-brand-navy"
                : "text-muted-foreground hover:text-brand-navy hover:bg-brand-navy/10"
            )}
            title={isActive ? t('deactivate') : t('setActive')}
          >
            {isActive ? <TimerOff className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
          </Button>
        )}

        {/* Drag Handle */}
        {!completed && !showMoveButtons && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full text-brand-sky/40 hover:text-brand-sky cursor-grab active:cursor-grabbing"
            title={t('dragToReorder')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* Legacy move buttons */}
        {showMoveButtons && onMoveUp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-brand-navy hover:bg-brand-navy/10"
            title={t('actions.moveUp')}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </Button>
        )}

        {showMoveButtons && onMoveDown && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-brand-navy hover:bg-brand-navy/10"
            title={t('actions.moveDown')}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-brand-red hover:bg-brand-red/10"
          title={t('actions.deleteTask')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
