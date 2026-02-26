import { useTranslations } from "next-intl";
import { CreateNoteForm } from "@components/create-note-form";

export default function CreatePage() {
  const t = useTranslations("CreatePage");

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-gray-600">{t("description")}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <CreateNoteForm />
      </div>
    </main>
  );
}
