import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@switch-to-eu/ui/components/alert";

interface ServiceIssuesProps {
  issues: string[];
  title?: string;
}

export function ServiceIssues({ issues, title = "Why is this service problematic?" }: ServiceIssuesProps) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="sticky top-24 border rounded-lg p-6 bg-muted mb-6">
      <h2 className="text-xl font-bold mb-4 text-destructive">{title}</h2>
      <Alert className="mb-4 border-destructive/20 bg-destructive/10">
        <AlertTitle className="text-destructive">Non-EU Service Warning</AlertTitle>
        <AlertDescription className="text-destructive">
          This service is based outside the EU and may not provide the privacy protections required by GDPR.
        </AlertDescription>
      </Alert>
      <ul className="space-y-3">
        {issues.map((issue, index) => (
          <li
            key={index}
            className="p-3 rounded-md bg-card border-l-2 border-destructive"
          >
            <div className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <p className="text-sm text-muted-foreground">{issue}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
