"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@switch-to-eu/ui/components/form";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";

const createFormSchema = (invalidEmail: string) =>
  z.object({
    email: z.string().email({ message: invalidEmail }),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

type Status = "idle" | "submitting" | "success" | "already" | "error";

/**
 * Newsletter sign-up on a sage anchor panel: what readers get on the left,
 * one email field with the button inside it on the right (the same pill as
 * the site search). The API only needs the email address.
 */
export const NewsletterCta = ({
  contained = true,
}: {
  contained?: boolean;
}) => {
  const t = useTranslations("newsletter");
  const v = useTranslations("validation");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(v("invalidEmail"))),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: FormValues) => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: locale }),
      });
      // 409: the address is already on the list. Not an error for the reader.
      if (response.status === 409) {
        setStatus("already");
        return;
      }
      if (!response.ok) {
        throw new Error(`subscribe-failed-${response.status}`);
      }
      setStatus("success");
      form.reset();
    } catch (error) {
      console.error("Error submitting newsletter form:", error);
      setStatus("error");
    }
  };

  const done = status === "success" || status === "already";

  const panel = (
    <div className="bg-brand-sage md:rounded-3xl px-6 sm:px-10 md:px-14 py-9 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 lg:items-center">
        <div className="lg:col-span-6">
          <h2 className="font-heading text-3xl sm:text-4xl leading-[1.05] text-brand-green text-balance mb-3">
            {t("title")}
          </h2>
          <p className="text-[#1a1a1a] text-base sm:text-lg leading-relaxed max-w-xl">
            {t("description")}
          </p>
        </div>

        <div className="lg:col-span-6" aria-live="polite">
          {done ? (
            <p className="flex items-start gap-3 rounded-3xl bg-white px-5 py-4 font-semibold text-[#1a1a1a]">
              <CircleCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-green"
                aria-hidden="true"
              />
              {status === "success" ? t("successMessage") : t("alreadySubscribed")}
            </p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="gap-2">
                      <FormLabel className="sr-only">{t("emailLabel")}</FormLabel>
                      <div className="flex items-center gap-2 rounded-full border border-brand-green/20 bg-white py-1.5 pl-5 pr-1.5 transition-colors focus-within:border-brand-green focus-within:ring-4 focus-within:ring-brand-green/20 sm:pl-6">
                        <FormControl>
                          <input
                            type="email"
                            autoComplete="email"
                            placeholder={t("emailPlaceholder")}
                            {...field}
                            className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#1a1a1a] placeholder:text-[#1a1a1a]/65 focus:outline-none"
                          />
                        </FormControl>
                        <button
                          type="submit"
                          disabled={status === "submitting"}
                          className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green sm:px-6 sm:text-base"
                        >
                          {status === "submitting" ? t("submitting") : t("submitLabel")}
                        </button>
                      </div>
                      <FormMessage className="pl-5 font-semibold text-[#1a1a1a]" />
                    </FormItem>
                  )}
                />
                {status === "error" && (
                  <p
                    role="alert"
                    className="mt-3 flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-[#1a1a1a]"
                  >
                    <CircleAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-red"
                      aria-hidden="true"
                    />
                    {t("errorMessage")}
                  </p>
                )}
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section>
      {contained ? <Container noPaddingMobile>{panel}</Container> : panel}
    </section>
  );
};
