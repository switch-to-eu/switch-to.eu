"use client";

import { Card, CardContent, CardHeader } from "@switch-to-eu/ui/components/card";

export function GroupLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
      </div>

      {/* Expenses skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Balances skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
