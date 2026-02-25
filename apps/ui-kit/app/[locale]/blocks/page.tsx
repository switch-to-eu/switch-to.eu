"use client";

import { Globe, Package } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { Container } from "@switch-to-eu/blocks/components/container";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";
import {
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionFooter,
} from "@switch-to-eu/blocks/components/section-card";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl mb-4">{title}</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export default function BlocksPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Blocks</h1>
      <p className="text-muted-foreground mb-8">
        Page-level shared components from{" "}
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          @switch-to-eu/blocks
        </code>
        .
      </p>

      {/* Header */}
      <Section title="Header">
        <Header
          logo={
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">AppName</span>
            </div>
          }
          navigation={
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Home</Button>
              <Button variant="ghost" size="sm">About</Button>
              <Button size="sm">Get Started</Button>
            </div>
          }
        />
      </Section>

      {/* Footer */}
      <Section title="Footer">
        <Footer
          links={[
            { label: "About", href: "#" },
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "GitHub", href: "#", external: true },
          ]}
          copyright={<>&copy; 2025 Example App</>}
          branding={<BrandIndicator variant="compact" asSpan />}
        />
      </Section>

      {/* BrandIndicator */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">BrandIndicator</h2>
        <div className="rounded-xl border border-border p-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              variant=&quot;default&quot;
            </p>
            <BrandIndicator variant="default" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              variant=&quot;compact&quot;
            </p>
            <BrandIndicator variant="compact" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              variant=&quot;default&quot; showIcon
            </p>
            <BrandIndicator variant="default" showIcon />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              asSpan (no link)
            </p>
            <BrandIndicator variant="default" asSpan />
          </div>
        </div>
      </section>

      {/* LanguageSelector */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">LanguageSelector</h2>
        <div className="rounded-xl border border-border p-6">
          <p className="text-xs text-muted-foreground mb-3 font-mono">
            Dropdown locale switcher (en/nl)
          </p>
          <LanguageSelector locale="en" />
        </div>
      </section>

      {/* Container */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Container</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <Container className="bg-primary/5 py-8">
            <p className="text-center text-muted-foreground">
              Content inside a <code className="text-sm bg-muted px-1 py-0.5 rounded">Container</code> — max-w-7xl with responsive padding.
            </p>
          </Container>
        </div>
      </section>

      {/* SectionCard */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">SectionCard</h2>
        <div className="rounded-xl border border-border p-6">
          <SectionCard>
            <SectionHeader
              icon={<Globe className="h-5 w-5" />}
              title="Section Title"
              description="A brief description of this section."
            />
            <SectionContent>
              <p>Section content goes here. This is the main content area.</p>
            </SectionContent>
            <SectionFooter>
              <div className="flex justify-end">
                <Button size="sm">Action</Button>
              </div>
            </SectionFooter>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
