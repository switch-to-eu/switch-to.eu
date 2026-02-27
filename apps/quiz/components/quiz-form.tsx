"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";

import { api } from "@/lib/trpc-client";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { QuestionEditor } from "@components/question-editor";
import type { DecryptedQuestion, DecryptedQuizData } from "@/lib/interfaces";

const TIMER_OPTIONS = [0, 10, 20, 30, 60];
const EXPIRATION_OPTIONS = [
  { hours: 1, labelKey: "hours" as const },
  { hours: 6, labelKey: "hours" as const },
  { hours: 24, labelKey: "hours" as const },
  { hours: 168, labelKey: "days" as const },
];

interface QuestionWithId {
  id: string;
  question: DecryptedQuestion;
}

function createEmptyQuestionWithId(): QuestionWithId {
  return {
    id: nanoid(),
    question: {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    },
  };
}

function SortableQuestionEditor({
  item,
  index,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
  isSubmitting,
}: {
  item: QuestionWithId;
  index: number;
  onChange: (question: DecryptedQuestion) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  isSubmitting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        index={index}
        question={item.question}
        onChange={onChange}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        canRemove={canRemove && !isSubmitting}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export function QuizForm() {
  const t = useTranslations("create");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionWithId[]>([createEmptyQuestionWithId()]);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [expirationHours, setExpirationHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const createQuiz = api.quiz.create.useMutation();
  const addQuestion = api.quiz.addQuestion.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);

  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestionWithId()]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDuplicateQuestion = (index: number) => {
    const source = questions[index];
    if (!source) return;
    const duplicate: QuestionWithId = {
      id: nanoid(),
      question: {
        text: source.question.text,
        options: [...source.question.options],
        correctIndex: source.question.correctIndex,
      },
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicate);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = useCallback((index: number, question: DecryptedQuestion) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, question };
      return next;
    });
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setQuestions(arrayMove(questions, oldIndex, newIndex));
      }
    },
    [questions],
  );

  const activeQuestion = activeId ? questions.find((q) => q.id === activeId) : null;

  const validate = (): string | null => {
    if (!title.trim()) return t("fillQuestionText");
    if (questions.length === 0) return t("needAtLeastOneQuestion");

    for (const q of questions) {
      if (!q.question.text.trim()) return t("fillQuestionText");
      if (q.question.options.some((o) => !o.trim())) return t("fillAllOptions");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const encryptionKey = await generateEncryptionKey();

      // Encrypt quiz metadata
      const quizData: DecryptedQuizData = {
        title: title.trim(),
        description: description.trim(),
      };
      const encryptedData = await encryptData(quizData, encryptionKey);

      // Create the quiz
      const result = await createQuiz.mutateAsync({
        encryptedData,
        timerSeconds,
        expirationHours,
      });

      // Add questions one by one (each encrypted)
      for (const { question } of questions) {
        const encryptedQuestion = await encryptData(question, encryptionKey);
        await addQuestion.mutateAsync({
          quizId: result.quiz.id,
          adminToken: result.adminToken,
          encryptedQuestion,
        });
      }

      // Redirect to admin page with token + key in fragment
      const locale = window.location.pathname.split("/")[1];
      const fragment = `token=${encodeURIComponent(result.adminToken)}&key=${encodeURIComponent(encryptionKey)}`;
      window.location.href = `/${locale}/quiz/${result.quiz.id}/admin#${fragment}`;
    } catch {
      setError("Failed to create quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quiz metadata */}
      <div className="space-y-4">
        <div>
          <label htmlFor="quiz-title" className="mb-1 block text-sm font-medium">
            {t("quizTitle")}
          </label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("quizTitlePlaceholder")}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="quiz-description" className="mb-1 block text-sm font-medium">
            {t("quizDescription")}
          </label>
          <Input
            id="quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("quizDescriptionPlaceholder")}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("questions")}</h2>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {questions.map((item, index) => (
                <SortableQuestionEditor
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(q) => handleQuestionChange(index, q)}
                  onRemove={() => handleRemoveQuestion(index)}
                  onDuplicate={() => handleDuplicateQuestion(index)}
                  canRemove={questions.length > 1}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeQuestion ? (
              <div className="rounded-lg border bg-white p-5 shadow-lg opacity-90">
                <p className="font-medium">{activeQuestion.question.text || t("questionPlaceholder")}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddQuestion}
          className="mt-4 w-full"
          disabled={isSubmitting}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addQuestion")}
        </Button>
      </div>

      {/* Settings */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold">{t("settings")}</h2>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("timerPerQuestion")}
          </label>
          <div className="flex gap-2">
            {TIMER_OPTIONS.map((seconds) => (
              <Button
                key={seconds}
                type="button"
                variant={timerSeconds === seconds ? "default" : "outline"}
                size="sm"
                onClick={() => setTimerSeconds(seconds)}
                disabled={isSubmitting}
                className={timerSeconds === seconds ? "gradient-primary text-white" : ""}
              >
                {seconds === 0 ? t("noTimer") : t("seconds", { count: seconds })}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("expiration")}
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPIRATION_OPTIONS.map(({ hours, labelKey }) => (
              <Button
                key={hours}
                type="button"
                variant={expirationHours === hours ? "default" : "outline"}
                size="sm"
                onClick={() => setExpirationHours(hours)}
                disabled={isSubmitting}
                className={expirationHours === hours ? "gradient-primary text-white" : ""}
              >
                {labelKey === "days"
                  ? t("days", { count: hours / 24 })
                  : t("hours", { count: hours })}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full gradient-primary text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("creating")}
          </>
        ) : (
          t("createQuiz")
        )}
      </Button>
    </form>
  );
}
