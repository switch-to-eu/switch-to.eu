"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@switch-to-eu/ui/components/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@switch-to-eu/ui/components/form";

import { Input } from "@switch-to-eu/ui/components/input";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";

const createFormSchema = (validation: { required: string; invalidEmail: string }) =>
  z.object({
    firstname: z.string().min(1, { message: validation.required }),
    email: z.string().email({ message: validation.invalidEmail }),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export const NewsletterCta = ({ contained = true }: { contained?: boolean }) => {
  const t = useTranslations("newsletter");
  const v = useTranslations("validation");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Wrapper = contained
    ? (props: { children: React.ReactNode }) => <Container noPaddingMobile>{props.children}</Container>
    : "div";

  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema({
      required: v("required"),
      invalidEmail: v("invalidEmail"),
    })),
    defaultValues: {
      firstname: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          first_name: data.firstname,
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(
          errorData.message ?? "Failed to subscribe to newsletter"
        );
      }

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting newsletter form:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <Wrapper>
        <Banner
          color="bg-brand-navy"
          shapes={[
            { shape: "sunburst", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.2 },
            { shape: "blob", className: "-bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52", delay: "-3s" },
            { shape: "spark", className: "top-1/2 right-1/4 w-24 h-24 sm:w-36 sm:h-36 -translate-y-1/2", opacity: 0.1, delay: "-5s" },
          ]}
          contentClassName="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-8 sm:mb-10">
            {t("title")}
          </h2>
          <p className="text-brand-sky text-base sm:text-lg mb-8 sm:mb-10">
            {t("description")}
          </p>

          {!isSuccess ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel className="text-brand-sky/80 text-sm">
                          {t("firstNameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            className="h-12 px-5 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-full focus:border-brand-yellow focus:ring-brand-yellow"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel className="text-brand-sky/80 text-sm">
                          {t("emailLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                            className="h-12 px-5 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-full focus:border-brand-yellow focus:ring-brand-yellow"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {error && (
                  <div className="bg-brand-red/20 text-brand-red p-3 rounded-full text-sm">
                    {error}
                  </div>
                )}
                <Button
                  variant="cta"
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90 rounded-full font-semibold"
                >
                  {isSubmitting ? "..." : t("submitLabel")}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="bg-brand-green/30 p-6 rounded-3xl">
              <p className="text-white text-lg font-medium">
                {t("successMessage")}
              </p>
            </div>
          )}
        </Banner>
      </Wrapper>
    </section>
  );
};
