"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Mail,
  Search,
  Terminal,
  ArrowRight,
} from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { Badge } from "@switch-to-eu/ui/components/badge";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@switch-to-eu/ui/components/card";
import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Label } from "@switch-to-eu/ui/components/label";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Switch } from "@switch-to-eu/ui/components/switch";
import { Separator } from "@switch-to-eu/ui/components/separator";
import { Skeleton } from "@switch-to-eu/ui/components/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@switch-to-eu/ui/components/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@switch-to-eu/ui/components/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@switch-to-eu/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@switch-to-eu/ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@switch-to-eu/ui/components/sheet";

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
      <div className="rounded-xl border border-border p-6">{children}</div>
    </section>
  );
}

export default function ComponentsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h1 className="text-4xl mb-2">Components</h1>
      <p className="text-muted-foreground mb-8">
        All shared UI components from <code className="text-sm bg-muted px-1.5 py-0.5 rounded">@switch-to-eu/ui</code>.
      </p>

      {/* Buttons */}
      <Section title="Button">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="search"><Search className="h-4 w-4" /> Search</Button>
              <Button variant="red">Red</Button>
              <Button variant="cta">CTA <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Mail /></Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">States</p>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <LoadingButton loading loadingText="Loading...">Submit</LoadingButton>
              <LoadingButton
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
              >
                Click to load
              </LoadingButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badge">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">RegionBadge</p>
            <div className="flex flex-wrap gap-3">
              <RegionBadge region="eu" />
              <RegionBadge region="non-eu" />
              <RegionBadge region="eu-friendly" />
            </div>
          </div>
        </div>
      </Section>

      {/* Card */}
      <Section title="Card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                Card description with supporting text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content area. Put any content here.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
          <Card className="bg-brand-sky">
            <CardHeader>
              <CardTitle className="text-brand-green">Brand Color Card</CardTitle>
              <CardDescription className="text-brand-green/70">
                Using brand-sky background color.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-brand-green">Cards can use brand colors for visual variety.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="input-demo">Input</Label>
            <Input id="input-demo" placeholder="Type something..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-demo">Email with icon</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email-demo" placeholder="email@example.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textarea-demo">Textarea</Label>
            <Textarea id="textarea-demo" placeholder="Write a message..." />
          </div>
          <div className="space-y-2">
            <Label>Select</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option-1">Option 1</SelectItem>
                <SelectItem value="option-2">Option 2</SelectItem>
                <SelectItem value="option-3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-demo" />
            <Label htmlFor="checkbox-demo">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="switch-demo" />
            <Label htmlFor="switch-demo">Enable notifications</Label>
          </div>
        </div>
      </Section>

      {/* Alert */}
      <Section title="Alert">
        <div className="space-y-4 max-w-lg">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* Tooltip */}
      <Section title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Section>

      {/* Dialog */}
      <Section title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description. It provides context for the dialog content.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </Section>

      {/* Sheet */}
      <Section title="Sheet">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>
                This is a sheet — a slide-out panel for secondary content.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 px-4">
              <p>Sheet content goes here.</p>
            </div>
          </SheetContent>
        </Sheet>
      </Section>

      {/* Dropdown Menu */}
      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Options <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Check className="h-4 w-4" /> Option 1
            </DropdownMenuItem>
            <DropdownMenuItem>Option 2</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* CTA on Dark Background */}
      <Section title="CTA on Dark Background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-brand-navy p-8 flex flex-col items-center gap-4">
            <p className="text-white text-sm font-mono">bg-brand-navy</p>
            <p className="text-white text-lg font-bold text-center">Yellow CTA on navy</p>
            <Button className="bg-brand-yellow text-brand-green hover:bg-brand-yellow/90 font-bold">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-xl bg-brand-green p-8 flex flex-col items-center gap-4">
            <p className="text-white text-sm font-mono">bg-brand-green</p>
            <p className="text-white text-lg font-bold text-center">White CTA on green</p>
            <Button className="bg-white text-brand-green hover:bg-white/90 font-bold">
              Learn More <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* Separator */}
      <Section title="Separator">
        <div className="space-y-4">
          <p>Content above</p>
          <Separator />
          <p>Content below</p>
        </div>
      </Section>

      {/* Skeleton */}
      <Section title="Skeleton">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </Section>
    </div>
  );
}
