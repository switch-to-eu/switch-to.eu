'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the validation schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }).refine(val => !/[<>]/.test(val), {
    message: 'HTML tags are not allowed in the title.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }).refine(val => !/[<>]/.test(val), {
    message: 'HTML tags are not allowed in the description.',
  }),
  category: z.enum(['bug', 'feature', 'feedback', 'other'], {
    required_error: 'Please select a category.',
  }),
  contactInfo: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  csrfToken: z.string(),
});

// Type for the form values
type FormValues = z.infer<typeof formSchema>;

interface FeedbackFormProps {
  dictionary: {
    title?: string;
    description?: string;
    category?: string;
    contactInfo?: string;
    bug?: string;
    feature?: string;
    feedback?: string;
    other?: string;
    submit?: string;
    success?: string;
    error?: string;
    titleLabel?: string;
    titlePlaceholder?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    categoryLabel?: string;
    categoryPlaceholder?: string;
    contactInfoLabel?: string;
    contactInfoPlaceholder?: string;
  };
}

export default function FeedbackForm({ dictionary }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate a CSRF token
  useEffect(() => {
    // Create a random CSRF token
    const token = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setCsrfToken(token);

    // Store in session storage (more secure than localStorage)
    sessionStorage.setItem('csrfToken', token);
  }, []);

  // Fallback text if dictionary values are not provided
  const text = {
    title: dictionary.title || 'Give Feedback',
    description: dictionary.description || 'Share your thoughts, report bugs, or suggest features.',
    titleLabel: dictionary.titleLabel || 'Title',
    titlePlaceholder: dictionary.titlePlaceholder || 'Brief summary of your feedback',
    descriptionLabel: dictionary.descriptionLabel || 'Description',
    descriptionPlaceholder: dictionary.descriptionPlaceholder || 'Please provide details...',
    categoryLabel: dictionary.categoryLabel || 'Category',
    categoryPlaceholder: dictionary.categoryPlaceholder || 'Select a category',
    bug: dictionary.bug || 'Bug Report',
    feature: dictionary.feature || 'Feature Request',
    feedback: dictionary.feedback || 'General Feedback',
    other: dictionary.other || 'Other',
    contactInfoLabel: dictionary.contactInfoLabel || 'Email (optional)',
    contactInfoPlaceholder: dictionary.contactInfoPlaceholder || 'Your email for follow-up',
    submit: dictionary.submit || 'Submit Feedback',
    success: dictionary.success || 'Thank you for your feedback! Your issue has been created.',
    error: dictionary.error || 'An error occurred while submitting your feedback. Please try again.'
  };

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      contactInfo: '',
      csrfToken: csrfToken,
    },
  });

  // Update the CSRF token in form values when it changes
  useEffect(() => {
    form.setValue('csrfToken', csrfToken);
  }, [csrfToken, form]);

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Verify the CSRF token matches what's in session storage
      const storedToken = sessionStorage.getItem('csrfToken');
      if (data.csrfToken !== storedToken) {
        throw new Error('CSRF token validation failed');
      }

      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      setSubmitStatus('success');
      setIssueUrl(result.issueUrl);
      form.reset();

      // Generate a new CSRF token after successful submission
      const newToken = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setCsrfToken(newToken);
      sessionStorage.setItem('csrfToken', newToken);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{text.titleLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={text.titlePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{text.descriptionLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={text.descriptionPlaceholder}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{text.categoryLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={text.categoryPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bug">{text.bug}</SelectItem>
                      <SelectItem value="feature">{text.feature}</SelectItem>
                      <SelectItem value="feedback">{text.feedback}</SelectItem>
                      <SelectItem value="other">{text.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{text.contactInfoLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={text.contactInfoPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden CSRF token field */}
            <input type="hidden" {...form.register('csrfToken')} />

            {submitStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  {text.success}
                  {issueUrl && (
                    <div className="mt-2">
                      <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Issue
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{text.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Submitting...' : text.submit}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}