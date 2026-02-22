"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../lib/types';

interface TasksContextType {
  tasks: Task[];
  activeTaskId: string | null;
  isLoading: boolean;
  addTask: (description: string) => void;
  updateTask: (id: string, description: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementTaskPomodoros: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  clearCompleted: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'keepfocus-tasks';
const ACTIVE_TASK_STORAGE_KEY = 'keepfocus-active-task';

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks and active task from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load tasks
        const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
          }));
          setTasks(tasksWithDates);
        }

        // Load active task
        const savedActiveTask = localStorage.getItem(ACTIVE_TASK_STORAGE_KEY);
        if (savedActiveTask) {
          setActiveTaskId(savedActiveTask);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
        setActiveTaskId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    }
  }, [tasks, isLoading]);

  // Save active task to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        if (activeTaskId) {
          localStorage.setItem(ACTIVE_TASK_STORAGE_KEY, activeTaskId);
        } else {
          localStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to save active task:', error);
      }
    }
  }, [activeTaskId, isLoading]);

  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addTask = (description: string) => {
    const newTask: Task = {
      id: generateId(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
      pomodoros: 0,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, description: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, description: description.trim() } : task
    ));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));

    // If the task was active and is being completed, clear active task
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));

    // If the deleted task was active, clear active task
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const setActiveTask = (id: string | null) => {
    // Only allow setting active task if it exists and is not completed
    if (id) {
      const task = tasks.find(t => t.id === id);
      if (task && !task.completed) {
        setActiveTaskId(id);
      }
    } else {
      setActiveTaskId(null);
    }
  };

  const incrementTaskPomodoros = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
    ));
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    if (startIndex < 0 || endIndex < 0 || startIndex >= activeTasks.length || endIndex >= activeTasks.length) {
      return;
    }

    const newActiveTasks = [...activeTasks];
    const movedItems = newActiveTasks.splice(startIndex, 1);

    if (movedItems.length === 0) {
      return; // Safety check
    }

    const movedTask = movedItems[0]!; // Safe since we checked length above
    newActiveTasks.splice(endIndex, 0, movedTask);

    setTasks([...newActiveTasks, ...completedTasks]);
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  return (
    <TasksContext.Provider value={{
      tasks,
      activeTaskId,
      isLoading,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      setActiveTask,
      incrementTaskPomodoros,
      reorderTasks,
      clearCompleted,
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};