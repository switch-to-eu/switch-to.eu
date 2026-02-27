"use client";

import { useState, useCallback } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { api } from "@/lib/trpc-client";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@switch-to-eu/ui/components/field";
import { QuestionEditor } from "@components/question-editor";
import { quizFormSchema, type QuizFormData } from "@/lib/schemas";
import type { DecryptedQuestion, DecryptedQuizData } from "@/lib/interfaces";
import type { FieldErrors } from "react-hook-form";
import type { QuestionFormData } from "@/lib/schemas";

const TIMER_OPTIONS = [0, 10, 20, 30, 60];
const EXPIRATION_OPTIONS = [
  { hours: 1, labelKey: "hours" as const },
  { hours: 6, labelKey: "hours" as const },
  { hours: 24, labelKey: "hours" as const },
  { hours: 168, labelKey: "days" as const },
];

function SortableQuestionEditor({
  fieldId,
  index,
  question,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
  isSubmitting,
  errors,
}: {
  fieldId: string;
  index: number;
  question: DecryptedQuestion;
  onChange: (question: DecryptedQuestion) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  isSubmitting: boolean;
  errors?: FieldErrors<QuestionFormData>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        index={index}
        question={question}
        onChange={onChange}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        canRemove={canRemove && !isSubmitting}
        errors={errors}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export function QuizForm() {
  const t = useTranslations("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [{ text: "", options: ["", "", "", ""], correctIndex: 0 }],
      timerSeconds: 20,
      expirationHours: 24,
    },
  });

  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: "questions",
  });

  const createQuiz = api.quiz.create.useMutation();
  const addQuestion = api.quiz.addQuestion.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    },
    [fields, move],
  );

  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);

    try {
      const encryptionKey = await generateEncryptionKey();

      const quizData: DecryptedQuizData = {
        title: data.title.trim(),
        description: data.description?.trim() ?? "",
      };
      const encryptedData = await encryptData(quizData, encryptionKey);

      const result = await createQuiz.mutateAsync({
        encryptedData,
        timerSeconds: data.timerSeconds,
        expirationHours: data.expirationHours,
      });

      for (const question of data.questions) {
        const encryptedQuestion = await encryptData(question, encryptionKey);
        await addQuestion.mutateAsync({
          quizId: result.quiz.id,
          adminToken: result.adminToken,
          encryptedQuestion,
        });
      }

      const locale = window.location.pathname.split("/")[1];
      const fragment = `token=${encodeURIComponent(result.adminToken)}&key=${encodeURIComponent(encryptionKey)}`;
      window.location.href = `/${locale}/quiz/${result.quiz.id}/admin#${fragment}`;
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Quiz metadata */}
      <div className="space-y-4">
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("quizTitle")}
              </FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("quizTitlePlaceholder")}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("quizDescription")}
              </FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("quizDescriptionPlaceholder")}
                  disabled={isSubmitting}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />
      </div>

      {/* Questions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("questions")}</h2>
        {errors.questions?.root && (
          <p className="mb-4 text-sm text-destructive">{errors.questions.root.message}</p>
        )}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {fields.map((fieldItem, index) => (
                <Controller
                  key={fieldItem.id}
                  name={`questions.${index}`}
                  control={control}
                  render={({ field }) => (
                    <SortableQuestionEditor
                      fieldId={fieldItem.id}
                      index={index}
                      question={field.value as DecryptedQuestion}
                      onChange={(q) => field.onChange(q)}
                      onRemove={() => remove(index)}
                      onDuplicate={() => {
                        const source = field.value;
                        insert(index + 1, {
                          text: source.text,
                          options: [...source.options],
                          correctIndex: source.correctIndex,
                        });
                      }}
                      canRemove={fields.length > 1}
                      isSubmitting={isSubmitting}
                      errors={errors.questions?.[index]}
                    />
                  )}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeField ? (
              <div className="rounded-lg border bg-white p-5 shadow-lg opacity-90">
                <p className="font-medium">{activeField.text || t("questionPlaceholder")}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ text: "", options: ["", "", "", ""], correctIndex: 0 })}
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

        <Controller
          name="timerSeconds"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("timerPerQuestion")}</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map((seconds) => (
                    <Button
                      key={seconds}
                      type="button"
                      variant={field.value === seconds ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(seconds)}
                      disabled={isSubmitting}
                      className={field.value === seconds ? "gradient-primary text-white" : ""}
                    >
                      {seconds === 0 ? t("noTimer") : t("seconds", { count: seconds })}
                    </Button>
                  ))}
                </div>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="expirationHours"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("expiration")}</FieldLabel>
              <FieldContent>
                <div className="flex flex-wrap gap-2">
                  {EXPIRATION_OPTIONS.map(({ hours, labelKey }) => (
                    <Button
                      key={hours}
                      type="button"
                      variant={field.value === hours ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(hours)}
                      disabled={isSubmitting}
                      className={field.value === hours ? "gradient-primary text-white" : ""}
                    >
                      {labelKey === "days"
                        ? t("days", { count: hours / 24 })
                        : t("hours", { count: hours })}
                    </Button>
                  ))}
                </div>
              </FieldContent>
            </Field>
          )}
        />
      </div>

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
