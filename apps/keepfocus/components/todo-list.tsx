"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@switch-to-eu/ui/components/button';
import { Input } from '@switch-to-eu/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@switch-to-eu/ui/components/card';
import { Separator } from '@switch-to-eu/ui/components/separator';
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
      <Card className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm ${className || ''}`}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">{t('pomodoro.tasks.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm ${className || ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-gray-800">{displayTitle}</CardTitle>

        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            placeholder={displayPlaceholder}
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            maxLength={maxLength}
            className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {showCharacterWarning && (
          <p className="text-sm text-amber-600">
            {charactersRemaining} {t('pomodoro.tasks.charactersRemaining')}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Tasks Section */}
        <div className="space-y-2">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${completedTasks.length > 0 ? 'text-green-400' : 'text-gray-200'}`} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {completedTasks.length > 0
                  ? t('pomodoro.tasks.emptyState.allTasksCompleted')
                  : t('pomodoro.tasks.emptyState.readyToFocus')
                }
              </h3>
              <p className="text-sm">
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
          <>
            <Separator className="my-4" />
            <div>
              <Button
                variant="ghost"
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('pomodoro.tasks.completed')} ({completedTasks.length})
                {showCompleted ? ' ▼' : ' ▶'}
              </Button>

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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                    className="text-gray-600 hover:text-red-600 border-gray-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('pomodoro.tasks.clearCompleted')}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}