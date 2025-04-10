import { Metadata } from 'next';
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Contributing to Switch-to.EU | Content Guide',
  description: 'Learn how to contribute content to Switch-to.EU through GitHub by creating migration guides, adding service alternatives, and improving the platform.',
  keywords: ['github contribution', 'open source', 'EU alternatives', 'migration guides', 'pull request', 'fork repository'],
};

export default function ContributeGuidePage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:py-12">
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1a3c5a]">Contributing to Switch-to.EU Content</h1>
              <p className="text-base sm:text-lg text-[#334155] mb-6">
                A community-driven platform helping users switch from non-EU digital services to EU alternatives through clear, step-by-step migration guides.
              </p>
            </div>
            <div className="w-full max-w-[250px] h-[150px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="GitHub Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Repository Overview</h2>
            <p className="text-[#334155]">
              The switch-to-eu/content repository contains all the written content for our platform, organized as Markdown files. This includes migration guides, service descriptions, and other documentation.
            </p>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">What You Can Contribute</h2>
            <ul className="space-y-1 text-[#334155]">
              <li>Migration guides for switching from non-EU to EU services</li>
              <li>Documentation about EU service alternatives</li>
              <li>Updates or corrections to existing content</li>
              <li>Translations of existing content into other European languages</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Contribution Process</h2>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">1. Fork the Content Repository</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Go to <Link href="https://github.com/switch-to-eu/content" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/switch-to-eu/content</Link></li>
              <li>Click the &quot;Fork&quot; button in the top right corner</li>
              <li>This creates your personal copy of the content repository</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">2. Clone Your Fork (Optional)</h3>
            <p className="text-[#334155]">If you prefer to work locally:</p>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git clone https://github.com/switch-to-eu/content.git
                cd content</code></pre>
            </div>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">3. Create or Edit Content</h3>
            <p className="text-[#334155]"><strong>Option A: Edit Directly on GitHub</strong></p>
            <ul className="space-y-1 text-[#334155]">
              <li>Navigate to the file you want to edit in your fork</li>
              <li>Click the pencil icon to edit</li>
              <li>Make your changes in the editor</li>
            </ul>

            <p className="text-[#334155] mt-4"><strong>Option B: Edit Locally</strong></p>
            <ul className="space-y-1 text-[#334155]">
              <li>Create a branch: <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">git checkout -b your-branch-name</code></li>
              <li>Create or edit files using your preferred text editor</li>
              <li>Commit and push your changes</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">4. Follow Content Structure</h3>
            <p className="text-[#334155]">Our content is organized as follows:</p>
            <ul className="space-y-1 text-[#334155]">
              <li><code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/guides/</code> - Migration guides organized by service category</li>
              <li><code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/alternatives/</code> - Information about EU service alternatives</li>
              <li><code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/templates/</code> - Templates for creating new content</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">5. Submit a Pull Request</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Navigate to your fork on GitHub</li>
              <li>Click &quot;Contribute&quot; then &quot;Open pull request&quot;</li>
              <li>Provide a clear title and description of your changes</li>
              <li>Submit the pull request</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Content Guidelines</h2>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">Formatting</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>All content should be written in Markdown</li>
              <li>Use headers (# ## ###) to organize content</li>
              <li>Include a title and brief introduction at the top of each guide</li>
              <li>Use screenshots where helpful (place in <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/images/</code> directory)</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">Writing Style</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Use clear, straightforward language</li>
              <li>Aim for step-by-step instructions where applicable</li>
              <li>Be factual and neutral when comparing services</li>
              <li>Focus on practical migration information</li>
              <li>Use inclusive language</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">Migration Guides Structure</h3>
            <p className="text-[#334155]">Each migration guide should include:</p>
            <ul className="space-y-1 text-[#334155]">
              <li>An overview of the migration process</li>
              <li>Prerequisites (accounts, tools needed)</li>
              <li>Step-by-step migration instructions</li>
              <li>Verification steps to ensure successful migration</li>
              <li>Troubleshooting common issues (if applicable)</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Review Process</h2>
            <p className="text-[#334155]">After submitting your pull request:</p>
            <ul className="space-y-1 text-[#334155]">
              <li>A maintainer will review your contribution</li>
              <li>You may receive feedback requesting changes</li>
              <li>Once approved, your content will be merged and published to the website</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Questions and Support</h2>
            <ul className="space-y-1 text-[#334155]">
              <li>Comment on related issues for context</li>
              <li>Ask questions in your pull request if you need clarification</li>
            </ul>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#1a3c5a]">Make a Difference Today</h2>
            <p className="text-[#334155] text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              Thank you for helping Europeans take control of their digital lives through quality content contributions!
            </p>
            <Button variant="red" asChild className="mx-auto">
              <Link href="https://github.com/switch-to-eu/content" target="_blank" rel="noopener noreferrer">Visit Content Repository</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}