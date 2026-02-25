import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TasksProvider, useTasks } from "../../hooks/use-tasks";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TasksProvider>{children}</TasksProvider>
);

function renderTasksHook() {
  return renderHook(() => useTasks(), { wrapper });
}

describe("useTasks", () => {
  describe("addTask", () => {
    it("adds a task with correct defaults", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Write tests");
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]!.description).toBe("Write tests");
      expect(result.current.tasks[0]!.completed).toBe(false);
      expect(result.current.tasks[0]!.pomodoros).toBe(0);
      expect(result.current.tasks[0]!.id).toMatch(/^task_/);
      expect(result.current.tasks[0]!.createdAt).toBeInstanceOf(Date);
    });

    it("trims whitespace from description", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("  padded task  ");
      });

      expect(result.current.tasks[0]!.description).toBe("padded task");
    });

    it("adds multiple tasks with unique IDs", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task 1");
      });
      act(() => {
        result.current.addTask("Task 2");
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0]!.id).not.toBe(result.current.tasks[1]!.id);
    });
  });

  describe("updateTask", () => {
    it("updates the description of an existing task", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Original");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.updateTask(id, "Updated");
      });

      expect(result.current.tasks[0]!.description).toBe("Updated");
    });

    it("trims whitespace from updated description", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Original");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.updateTask(id, "  trimmed  ");
      });

      expect(result.current.tasks[0]!.description).toBe("trimmed");
    });

    it("does not modify other tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task A");
      });
      act(() => {
        result.current.addTask("Task B");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.updateTask(id, "Task A Updated");
      });

      expect(result.current.tasks[1]!.description).toBe("Task B");
    });

    it("does not crash when ID does not exist", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task A");
      });

      expect(() => {
        act(() => {
          result.current.updateTask("nonexistent", "Updated");
        });
      }).not.toThrow();

      expect(result.current.tasks[0]!.description).toBe("Task A");
    });
  });

  describe("toggleTask", () => {
    it("toggles an incomplete task to completed", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.toggleTask(id);
      });

      expect(result.current.tasks[0]!.completed).toBe(true);
    });

    it("toggles a completed task back to incomplete", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.toggleTask(id);
      });
      act(() => {
        result.current.toggleTask(id);
      });

      expect(result.current.tasks[0]!.completed).toBe(false);
    });

    it("clears activeTaskId when the active task is toggled to completed", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });
      expect(result.current.activeTaskId).toBe(id);

      act(() => {
        result.current.toggleTask(id);
      });
      expect(result.current.activeTaskId).toBeNull();
    });

    it("does NOT clear activeTaskId when a non-active task is toggled", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task A");
      });
      act(() => {
        result.current.addTask("Task B");
      });
      const idA = result.current.tasks[0]!.id;
      const idB = result.current.tasks[1]!.id;

      act(() => {
        result.current.setActiveTask(idA);
      });

      act(() => {
        result.current.toggleTask(idB);
      });

      expect(result.current.activeTaskId).toBe(idA);
    });
  });

  describe("deleteTask", () => {
    it("removes the task from the list", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.deleteTask(id);
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it("clears activeTaskId when the active task is deleted", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });
      act(() => {
        result.current.deleteTask(id);
      });

      expect(result.current.activeTaskId).toBeNull();
    });

    it("does NOT clear activeTaskId when a non-active task is deleted", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task A");
      });
      act(() => {
        result.current.addTask("Task B");
      });
      const idA = result.current.tasks[0]!.id;
      const idB = result.current.tasks[1]!.id;

      act(() => {
        result.current.setActiveTask(idA);
      });
      act(() => {
        result.current.deleteTask(idB);
      });

      expect(result.current.activeTaskId).toBe(idA);
    });
  });

  describe("setActiveTask", () => {
    it("sets activeTaskId to a valid incomplete task", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });

      expect(result.current.activeTaskId).toBe(id);
    });

    it("refuses to set activeTaskId to a completed task", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.toggleTask(id);
      });
      act(() => {
        result.current.setActiveTask(id);
      });

      expect(result.current.activeTaskId).toBeNull();
    });

    it("sets activeTaskId to null when passed null", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });
      act(() => {
        result.current.setActiveTask(null);
      });

      expect(result.current.activeTaskId).toBeNull();
    });

    it("does not set activeTaskId for a non-existent task", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.setActiveTask("nonexistent");
      });

      expect(result.current.activeTaskId).toBeNull();
    });
  });

  describe("incrementTaskPomodoros", () => {
    it("increments pomodoros from 0 to 1", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.incrementTaskPomodoros(id);
      });

      expect(result.current.tasks[0]!.pomodoros).toBe(1);
    });

    it("increments correctly on repeated calls", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.incrementTaskPomodoros(id);
      });
      act(() => {
        result.current.incrementTaskPomodoros(id);
      });
      act(() => {
        result.current.incrementTaskPomodoros(id);
      });

      expect(result.current.tasks[0]!.pomodoros).toBe(3);
    });

    it("does not affect other tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task A");
      });
      act(() => {
        result.current.addTask("Task B");
      });
      const idA = result.current.tasks[0]!.id;

      act(() => {
        result.current.incrementTaskPomodoros(idA);
      });

      expect(result.current.tasks[1]!.pomodoros).toBe(0);
    });
  });

  describe("reorderTasks", () => {
    it("moves a task from one position to another among active tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });
      act(() => {
        result.current.addTask("B");
      });
      act(() => {
        result.current.addTask("C");
      });

      act(() => {
        result.current.reorderTasks(0, 2);
      });

      const descriptions = result.current.tasks.map((t) => t.description);
      expect(descriptions).toEqual(["B", "C", "A"]);
    });

    it("keeps completed tasks separate from active tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });
      act(() => {
        result.current.addTask("B");
      });
      act(() => {
        result.current.addTask("C (done)");
      });

      const doneId = result.current.tasks[2]!.id;
      act(() => {
        result.current.toggleTask(doneId);
      });

      // Reorder active tasks (A, B)
      act(() => {
        result.current.reorderTasks(0, 1);
      });

      const active = result.current.tasks.filter((t) => !t.completed);
      const completed = result.current.tasks.filter((t) => t.completed);

      expect(active.map((t) => t.description)).toEqual(["B", "A"]);
      expect(completed.map((t) => t.description)).toEqual(["C (done)"]);
    });

    it("no-ops when indices are out of bounds", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });
      act(() => {
        result.current.addTask("B");
      });

      act(() => {
        result.current.reorderTasks(0, 5);
      });

      expect(result.current.tasks.map((t) => t.description)).toEqual([
        "A",
        "B",
      ]);
    });

    it("no-ops when startIndex is negative", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });

      act(() => {
        result.current.reorderTasks(-1, 0);
      });

      expect(result.current.tasks[0]!.description).toBe("A");
    });
  });

  describe("clearCompleted", () => {
    it("removes all completed tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });
      act(() => {
        result.current.addTask("B");
      });
      act(() => {
        result.current.addTask("C");
      });

      const idA = result.current.tasks[0]!.id;
      const idC = result.current.tasks[2]!.id;

      act(() => {
        result.current.toggleTask(idA);
      });
      act(() => {
        result.current.toggleTask(idC);
      });
      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]!.description).toBe("B");
    });

    it("keeps all incomplete tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });
      act(() => {
        result.current.addTask("B");
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.tasks).toHaveLength(2);
    });

    it("no-ops when there are no completed tasks", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("A");
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.tasks).toHaveLength(1);
    });
  });

  describe("localStorage persistence", () => {
    it("saves tasks to localStorage on state change", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Saved task");
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "keepfocus-tasks",
        expect.stringContaining("Saved task"),
      );
    });

    it("saves active task to localStorage", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "keepfocus-active-task",
        id,
      );
    });

    it("removes active task key from localStorage when set to null", () => {
      const { result } = renderTasksHook();

      act(() => {
        result.current.addTask("Task");
      });
      const id = result.current.tasks[0]!.id;

      act(() => {
        result.current.setActiveTask(id);
      });
      act(() => {
        result.current.setActiveTask(null);
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        "keepfocus-active-task",
      );
    });

    it("loads tasks from localStorage on mount with Date deserialization", () => {
      const dateStr = "2024-01-15T10:30:00.000Z";
      const savedTasks = [
        {
          id: "task_1",
          description: "Loaded task",
          completed: false,
          createdAt: dateStr,
          pomodoros: 2,
        },
      ];

      (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
        (key: string) => {
          if (key === "keepfocus-tasks") return JSON.stringify(savedTasks);
          return null;
        },
      );

      const { result } = renderTasksHook();

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]!.description).toBe("Loaded task");
      expect(result.current.tasks[0]!.createdAt).toBeInstanceOf(Date);
      expect(result.current.tasks[0]!.pomodoros).toBe(2);
    });

    it("loads activeTaskId from localStorage on mount", () => {
      const savedTasks = [
        {
          id: "task_1",
          description: "Task",
          completed: false,
          createdAt: new Date().toISOString(),
          pomodoros: 0,
        },
      ];

      (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
        (key: string) => {
          if (key === "keepfocus-tasks") return JSON.stringify(savedTasks);
          if (key === "keepfocus-active-task") return "task_1";
          return null;
        },
      );

      const { result } = renderTasksHook();

      expect(result.current.activeTaskId).toBe("task_1");
    });

    it("handles corrupted localStorage gracefully", () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
        (key: string) => {
          if (key === "keepfocus-tasks") return "not valid json{{{";
          return null;
        },
      );

      const { result } = renderTasksHook();

      expect(result.current.tasks).toEqual([]);
      expect(result.current.activeTaskId).toBeNull();
    });
  });

  describe("context error", () => {
    it("throws when used outside TasksProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTasks());
      }).toThrow("useTasks must be used within a TasksProvider");

      consoleSpy.mockRestore();
    });
  });
});
