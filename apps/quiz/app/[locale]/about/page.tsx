import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-bricolage text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("description")}</p>

      <section className="mb-8">
        <h2 className="font-bricolage text-xl font-semibold mb-4">{t("howItWorks")}</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>{t("step3")}</li>
          <li>{t("step4")}</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="font-bricolage text-xl font-semibold mb-4">{t("privacy")}</h2>
        <p className="text-muted-foreground">{t("privacyText")}</p>
      </section>

      <section>
        <h2 className="font-bricolage text-xl font-semibold mb-4">{t("openSource")}</h2>
        <p className="text-muted-foreground">{t("openSourceText")}</p>
      </section>
    </main>
  );
}
