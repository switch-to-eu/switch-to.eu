"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { Input } from '@switch-to-eu/ui/components/input';
import { TaskItem } from './task-item';
import { useTasks } from '../hooks/use-tasks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TodoListProps {
  title?: string;
  placeholder?: string;
  maxLength?: number;
  showActiveButton?: boolean;
  showMoveButtons?: boolean;
  showCompletedSection?: boolean;
  className?: string;
}

export function TodoList({
  title,
  placeholder,
  maxLength = 200,
  showActiveButton = false,
  showMoveButtons = false, // Disabled by default since we have drag and drop
  showCompletedSection = true,
  className,
}: TodoListProps) {
  const t = useTranslations();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Use translations for default values
  const displayTitle = title || t('pomodoro.tasks.title');
  const displayPlaceholder = placeholder || t('pomodoro.tasks.placeholder');

  const {
    tasks,
    activeTaskId,
    isLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    setActiveTask,
    reorderTasks,
    clearCompleted,
  } = useTasks();

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeTasks = tasks.filter(task => !task.completed);
      const oldIndex = activeTasks.findIndex(task => task.id === active.id);
      const newIndex = activeTasks.findIndex(task => task.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(oldIndex, newIndex);
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskInput.trim() && newTaskInput.length <= maxLength) {
      addTask(newTaskInput.trim());
      setNewTaskInput('');
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const charactersRemaining = maxLength - newTaskInput.length;
  const showCharacterWarning = charactersRemaining <= 20;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-3xl border-2 border-brand-navy p-6 sm:p-8 ${className || ''}`}>
        <div className="py-8 text-center text-muted-foreground">{t('pomodoro.tasks.loading')}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border-2 border-brand-navy flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
        <h2 className="font-heading text-2xl uppercase text-brand-navy tracking-wide mb-4">
          {displayTitle}
        </h2>

        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            placeholder={displayPlaceholder}
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            maxLength={maxLength}
            className="flex-1 rounded-full border-border focus:border-brand-navy focus:ring-brand-navy"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {showCharacterWarning && (
          <p className="text-sm text-brand-orange mt-2">
            {charactersRemaining} {t('pomodoro.tasks.charactersRemaining')}
          </p>
        )}
      </div>

      {/* Task List */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4 flex-1">
        {/* Active Tasks Section */}
        <div className="space-y-2">
          {activeTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${completedTasks.length > 0 ? 'bg-brand-sky/20' : 'bg-brand-navy/5'}`}>
                <CheckCircle2 className={`w-8 h-8 ${completedTasks.length > 0 ? 'text-brand-sky' : 'text-brand-navy/30'}`} />
              </div>
              <h3 className="font-heading text-lg uppercase text-brand-navy mb-1">
                {completedTasks.length > 0
                  ? t('pomodoro.tasks.emptyState.allTasksCompleted')
                  : t('pomodoro.tasks.emptyState.readyToFocus')
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedTasks.length > 0
                  ? t('pomodoro.tasks.emptyState.tasksFinished')
                  : t('pomodoro.tasks.emptyState.addFirstTask')
                }
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    description={task.description}
                    completed={task.completed}
                    pomodoros={task.pomodoros}
                    isActive={activeTaskId === task.id}
                    onToggleComplete={() => toggleTask(task.id)}
                    onUpdate={(description) => updateTask(task.id, description)}
                    onDelete={() => deleteTask(task.id)}
                    onSetActive={showActiveButton ? () => setActiveTask(activeTaskId === task.id ? null : task.id) : undefined}
                    onMoveUp={
                      showMoveButtons && index > 0
                        ? () => reorderTasks(index, index - 1)
                        : undefined
                    }
                    onMoveDown={
                      showMoveButtons && index < activeTasks.length - 1
                        ? () => reorderTasks(index, index + 1)
                        : undefined
                    }
                    showActiveButton={showActiveButton}
                    showMoveButtons={showMoveButtons}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Completed Tasks Section */}
        {showCompletedSection && completedTasks.length > 0 && (
          <div>
            <div className="border-t border-border/50 my-4" />
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm text-brand-navy rounded-full bg-brand-navy/5 px-4 py-1.5 hover:bg-brand-navy/10 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('pomodoro.tasks.completed')} ({completedTasks.length})
              <span className="text-xs">{showCompleted ? '▼' : '▶'}</span>
            </button>

            {showCompleted && (
              <div className="mt-2 space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    description={task.description}
                    completed={task.completed}
                    pomodoros={task.pomodoros}
                    isActive={false}
                    onToggleComplete={() => toggleTask(task.id)}
                    onUpdate={(description) => updateTask(task.id, description)}
                    onDelete={() => deleteTask(task.id)}
                    showActiveButton={false}
                    showMoveButtons={false}
                  />
                ))}

                <button
                  onClick={clearCompleted}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-red transition-colors rounded-full px-3 py-1.5 border border-border/50 hover:border-brand-red/30 mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('pomodoro.tasks.clearCompleted')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
