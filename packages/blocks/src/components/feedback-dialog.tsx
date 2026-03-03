"use client";

import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@switch-to-eu/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@switch-to-eu/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@switch-to-eu/ui/components/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@switch-to-eu/ui/components/form";
import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import { Alert, AlertDescription } from "@switch-to-eu/ui/components/alert";
import { useIsMobile } from "@switch-to-eu/ui/hooks/use-is-mobile";

type ValidationMessages = {
  titleMinLength: string;
  titleNoHtml: string;
  descriptionMinLength: string;
  descriptionNoHtml: string;
  categoryRequired: string;
  invalidEmail: string;
};

const formSchema = (validationMessages: ValidationMessages) =>
  z.object({
    title: z
      .string()
      .min(5, { message: validationMessages.titleMinLength })
      .refine((val) => !/[<>]/.test(val), {
        message: validationMessages.titleNoHtml,
      }),
    description: z
      .string()
      .min(10, { message: validationMessages.descriptionMinLength })
      .refine((val) => !/[<>]/.test(val), {
        message: validationMessages.descriptionNoHtml,
      }),
    category: z.enum(["bug", "feature", "feedback", "other"], {
      required_error: validationMessages.categoryRequired,
    }),
    contactInfo: z
      .string()
      .email({ message: validationMessages.invalidEmail })
      .optional()
      .or(z.literal("")),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

interface FeedbackDialogProps {
  toolId: string;
  trigger: ReactNode;
}

export function FeedbackDialog({ toolId, trigger }: FeedbackDialogProps) {
  const t = useTranslations("feedback");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validationMessages: ValidationMessages = {
    titleMinLength: t("form.validation.titleMinLength"),
    titleNoHtml: t("form.validation.titleNoHtml"),
    descriptionMinLength: t("form.validation.descriptionMinLength"),
    descriptionNoHtml: t("form.validation.descriptionNoHtml"),
    categoryRequired: t("form.validation.categoryRequired"),
    invalidEmail: t("form.validation.invalidEmail"),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(validationMessages)),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      contactInfo: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tool: toolId }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitStatus("success");
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSubmitStatus("idle");
      form.reset();
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.categoryLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("form.categoryPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">
                    {t("form.bugCategory")}
                  </SelectItem>
                  <SelectItem value="feature">
                    {t("form.featureCategory")}
                  </SelectItem>
                  <SelectItem value="feedback">
                    {t("form.feedbackCategory")}
                  </SelectItem>
                  <SelectItem value="other">
                    {t("form.otherCategory")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.titleLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.titlePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.descriptionLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("form.descriptionPlaceholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.contactInfoLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.contactInfoPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitStatus === "success" && (
          <Alert
            variant="default"
            className="bg-success/10 text-success border-success/20"
          >
            <AlertDescription>{t("form.successMessage")}</AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert variant="destructive">
            <AlertDescription>{t("form.errorMessage")}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] bg-tool-primary text-tool-primary-foreground hover:bg-tool-primary/90"
          >
            {isSubmitting ? t("form.submitting") : t("form.submitButton")}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg overflow-y-auto max-h-[85vh] px-4 pb-6">
            <DrawerHeader className="px-0">
              <DrawerTitle>{t("dialogTitle")}</DrawerTitle>
              <DrawerDescription>
                {t("dialogDescription")}
              </DrawerDescription>
            </DrawerHeader>
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
