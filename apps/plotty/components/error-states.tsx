import { Lock, AlertTriangle, XCircle, FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@switch-to-eu/ui/components/button";
import { Card, CardContent } from "@switch-to-eu/ui/components/card";

export function MissingKeyError() {
  const t = useTranslations('ErrorStates.missingKey');

  return (
    <div className="py-0 sm:py-12 lg:py-16">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>
            <p className="mb-6">
              {t('message')}
            </p>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">{t('urlFormat')}</p>
              <code className="text-sm font-mono">
                {t('urlExample')}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PollNotFoundErrorProps {
  className?: string;
  isAdmin?: boolean;
}

export function PollNotFoundError({ isAdmin = false }: PollNotFoundErrorProps) {
  const t = useTranslations('ErrorStates.pollNotFound');

  return (
    <div className="py-0 sm:py-12 lg:py-16">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <FileQuestion className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">
              {isAdmin ? t('titleAdmin') : t('title')}
            </h1>
            <p className="mb-6">
              {isAdmin ? t('messageAdmin') : t('message')}
            </p>
            <Button onClick={() => window.location.href = '/'} className="px-6">
              {t('returnHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DecryptionErrorProps {
  className?: string;
  error?: string;
}

export function DecryptionError({ error }: DecryptionErrorProps) {
  const t = useTranslations('ErrorStates.decryption');

  return (
    <div className="py-0 sm:py-12 lg:py-16">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>
            <p className="mb-6">
              {t('message')}
            </p>
            <div className="rounded-lg border p-4 mb-6">
              <p className="text-sm font-medium mb-2">{t('technicalDetails')}</p>
              <code className="text-sm font-mono break-all">
                {error}
              </code>
            </div>
            <Button onClick={() => window.location.href = '/'} className="px-6">
              {t('returnHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}