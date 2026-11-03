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
          errorData.message ?? "subscribe-failed"
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
          color="bg-white border-y md:border border-black/10"
          shapes={[
            { shape: "sunburst", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.3, color: "text-brand-yellow" },
            { shape: "blob", className: "-bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52", delay: "-3s", opacity: 0.35, color: "text-brand-sky" },
            { shape: "spark", className: "top-1/2 right-1/4 w-24 h-24 sm:w-36 sm:h-36 -translate-y-1/2", opacity: 0.15, delay: "-5s", color: "text-brand-pink" },
          ]}
          contentClassName="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-green mb-8 sm:mb-10">
            {t("title")}
          </h2>
          <p className="text-[#1a1a1a] text-base sm:text-lg mb-8 sm:mb-10">
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
                        <FormLabel className="text-[#1a1a1a] text-sm font-semibold">
                          {t("firstNameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("firstNamePlaceholder")}
                            {...field}
                            className="h-12 px-5 bg-white border-black/20 text-[#1a1a1a] placeholder:text-[#1a1a1a]/65 rounded-full focus:border-brand-green focus:ring-brand-green/30"
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
                        <FormLabel className="text-[#1a1a1a] text-sm font-semibold">
                          {t("emailLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            {...field}
                            className="h-12 px-5 bg-white border-black/20 text-[#1a1a1a] placeholder:text-[#1a1a1a]/65 rounded-full focus:border-brand-green focus:ring-brand-green/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {error && (
                  <div role="alert" className="bg-brand-red/10 text-brand-red font-semibold px-5 py-3 rounded-full text-sm">
                    {t("errorMessage")}
                  </div>
                )}
                <Button
                  variant="cta"
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base bg-brand-green text-white hover:bg-brand-green/90 rounded-full font-semibold"
                >
                  {isSubmitting ? "..." : t("submitLabel")}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="bg-brand-sage/40 p-6 rounded-3xl">
              <p className="text-brand-green text-lg font-medium">
                {t("successMessage")}
              </p>
            </div>
          )}
        </Banner>
      </Wrapper>
    </section>
  );
};
