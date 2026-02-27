"use client";

import { Mail, Search, Eye, DollarSign } from "lucide-react";

import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Label } from "@switch-to-eu/ui/components/label";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Switch } from "@switch-to-eu/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import { RadioGroup, RadioGroupItem } from "@switch-to-eu/ui/components/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@switch-to-eu/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@switch-to-eu/ui/components/input-group";

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

export default function FormsPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Forms</h1>
      <p className="text-muted-foreground mb-8">
        Form elements and field components from{" "}
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">@switch-to-eu/ui</code>.
      </p>

      {/* Input */}
      <Section title="Input">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="input-basic">Basic</Label>
            <Input id="input-basic" placeholder="Type something..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="input-disabled">Disabled</Label>
            <Input id="input-disabled" placeholder="Cannot edit" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="input-invalid">Invalid</Label>
            <Input id="input-invalid" placeholder="Invalid input" aria-invalid="true" />
          </div>
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="textarea-basic">Basic</Label>
            <Textarea id="textarea-basic" placeholder="Write a message..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="textarea-disabled">Disabled</Label>
            <Textarea id="textarea-disabled" placeholder="Cannot edit" disabled />
          </div>
        </div>
      </Section>

      {/* Select */}
      <Section title="Select">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label>Basic</Label>
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
          <div className="space-y-2">
            <Label>With groups</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Citrus</SelectLabel>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="lemon">Lemon</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Berries</SelectLabel>
                  <SelectItem value="strawberry">Strawberry</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Small</Label>
            <Select>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Small trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-1" />
            <Label htmlFor="cb-1">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-2" defaultChecked />
            <Label htmlFor="cb-2">Checked by default</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-3" disabled />
            <Label htmlFor="cb-3">Disabled</Label>
          </div>
        </div>
      </Section>

      {/* Switch */}
      <Section title="Switch">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-2">
            <Switch id="sw-1" />
            <Label htmlFor="sw-1">Enable notifications</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="sw-2" size="sm" />
            <Label htmlFor="sw-2">Small switch</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="sw-3" disabled />
            <Label htmlFor="sw-3">Disabled</Label>
          </div>
        </div>
      </Section>

      {/* RadioGroup */}
      <Section title="RadioGroup">
        <div className="space-y-6 max-w-md">
          <RadioGroup defaultValue="option-1">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="option-1" id="radio-1" />
              <Label htmlFor="radio-1">Option One</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="option-2" id="radio-2" />
              <Label htmlFor="radio-2">Option Two</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="option-3" id="radio-3" />
              <Label htmlFor="radio-3">Option Three</Label>
            </div>
          </RadioGroup>
        </div>
      </Section>

      {/* Field */}
      <Section title="Field">
        <div className="space-y-8 max-w-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Vertical (default)</p>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="field-name">Name</FieldLabel>
                <FieldContent>
                  <Input id="field-name" placeholder="Enter your name" />
                  <FieldDescription>Your full name as it appears on your ID.</FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="field-email">Email</FieldLabel>
                <FieldContent>
                  <Input id="field-email" type="email" placeholder="you@example.com" />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Horizontal</p>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="field-h-name">Name</FieldLabel>
                <Input id="field-h-name" placeholder="Enter your name" />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="field-h-email">Email</FieldLabel>
                <Input id="field-h-email" type="email" placeholder="you@example.com" />
              </Field>
            </FieldGroup>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">With error</p>
            <Field data-invalid="true">
              <FieldLabel htmlFor="field-err">Username</FieldLabel>
              <FieldContent>
                <Input id="field-err" placeholder="Pick a username" aria-invalid="true" defaultValue="ab" />
                <FieldError>Username must be at least 3 characters.</FieldError>
              </FieldContent>
            </Field>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">With checkbox</p>
            <Field orientation="horizontal">
              <Checkbox id="field-cb" />
              <FieldLabel htmlFor="field-cb">
                I agree to the terms of service
              </FieldLabel>
            </Field>
          </div>
        </div>
      </Section>

      {/* FieldSet */}
      <Section title="FieldSet">
        <div className="space-y-8 max-w-lg">
          <FieldSet>
            <FieldLegend>Notification preferences</FieldLegend>
            <FieldDescription>Choose how you want to be notified.</FieldDescription>
            <RadioGroup defaultValue="email">
              <Field orientation="horizontal">
                <RadioGroupItem value="email" id="fs-email" />
                <FieldLabel htmlFor="fs-email">Email</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="sms" id="fs-sms" />
                <FieldLabel htmlFor="fs-sms">SMS</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="push" id="fs-push" />
                <FieldLabel htmlFor="fs-push">Push notification</FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Features</FieldLegend>
            <FieldDescription>Select the features you want to enable.</FieldDescription>
            <Field orientation="horizontal">
              <Checkbox id="fs-dark" />
              <FieldLabel htmlFor="fs-dark">Dark mode</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="fs-analytics" />
              <FieldLabel htmlFor="fs-analytics">Analytics</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="fs-newsletter" />
              <FieldLabel htmlFor="fs-newsletter">Newsletter</FieldLabel>
            </Field>
          </FieldSet>
        </div>
      </Section>

      {/* InputGroup */}
      <Section title="InputGroup">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label>With icon prefix</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText><Mail className="size-4" /></InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="email@example.com" />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>With text prefix</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="example.com" />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>With suffix</Label>
            <InputGroup>
              <InputGroupInput placeholder="Search..." />
              <InputGroupAddon align="inline-end">
                <InputGroupText><Search className="size-4" /></InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>With button</Label>
            <InputGroup>
              <InputGroupInput placeholder="Enter amount" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>
                  <DollarSign className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>With prefix and suffix</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText><DollarSign className="size-4" /></InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="0.00" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>USD</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>Textarea with icon</Label>
            <InputGroup>
              <InputGroupAddon align="block-start">
                <InputGroupText><Eye className="size-4" /> Preview</InputGroupText>
              </InputGroupAddon>
              <InputGroupTextarea placeholder="Write something..." />
            </InputGroup>
          </div>
        </div>
      </Section>
    </div>
  );
}
