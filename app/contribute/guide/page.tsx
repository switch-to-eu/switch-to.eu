import { Metadata } from 'next';
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Contributing to Switch-to.EU | GitHub Guide',
  description: 'Learn how to contribute to Switch-to.EU through GitHub by creating migration guides, adding service alternatives, and improving the platform.',
  keywords: ['github contribution', 'open source', 'EU alternatives', 'migration guides', 'pull request', 'fork repository'],
};

export default function ContributeGuidePage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:py-12">
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1a3c5a]">Contributing to Switch-to.EU through GitHub</h1>
              <p className="text-base sm:text-lg text-[#334155] mb-6">
                This guide will walk you through the process of contributing to Switch-to.EU using our GitHub repository.
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
            <h2 className="text-2xl font-bold text-[#1a3c5a]">Prerequisites</h2>
            <ul className="space-y-1 text-[#334155]">
              <li>A GitHub account</li>
              <li>Basic familiarity with Git (or willingness to learn)</li>
              <li>Knowledge about the topic you want to contribute to</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Contribution Workflow</h2>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">1. Find an Issue or Identify a Contribution</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Browse our <Link href="https://github.com/switch-to-eu/issues" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Issues</Link> section to find tasks that need help</li>
              <li>Or identify something you&apos;d like to improve that isn&apos;t listed</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">2. Fork the Repository</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Navigate to the <Link href="https://github.com/switch-to-eu" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Switch-to.EU repository</Link></li>
              <li>Click the &quot;Fork&quot; button in the top-right corner</li>
              <li>This creates your personal copy of the repository</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">3. Clone Your Fork Locally</h3>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git clone https://github.com/YOUR-USERNAME/switch-to-eu.git
                cd switch-to-eu</code></pre>
            </div>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">4. Create a Branch</h3>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git checkout -b your-branch-name</code></pre>
            </div>
            <p className="text-[#334155]">
              Name your branch something descriptive related to your contribution (e.g., <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">add-nextcloud-guide</code>, <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">fix-mastodon-screenshots</code>).
            </p>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">5. Make Your Changes</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>For guides: Add or edit files in the <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/guides</code> directory</li>
              <li>For alternatives: Update the appropriate files in the <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/alternatives</code> directory</li>
              <li>Follow our <Link href="https://github.com/switch-to-eu/content-guidelines" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">content guidelines</Link></li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">6. Commit Your Changes</h3>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git add .
                git commit -m &quot;Brief description of your changes&quot;</code></pre>
            </div>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">7. Push to Your Fork</h3>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git push origin your-branch-name</code></pre>
            </div>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">8. Create a Pull Request</h3>
            <ul className="space-y-1 text-[#334155]">
              <li>Navigate to your fork on GitHub</li>
              <li>Click &quot;Compare & pull request&quot; button for your branch</li>
              <li>Provide a clear title and description of your changes</li>
              <li>Submit the pull request</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">After Submitting</h2>
            <ul className="space-y-1 text-[#334155]">
              <li>A project maintainer will review your contribution</li>
              <li>You may receive feedback requesting changes</li>
              <li>Once approved, your contribution will be merged into the main project</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Communication Channels</h2>
            <ul className="space-y-1 text-[#334155]">
              <li>Comment on the relevant issue for context</li>
              <li>Join our <Link href="https://chat.switch-to.eu" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">community chat</Link> for real-time discussions</li>
              <li>Ask questions in the pull request if you need clarification</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 text-[#1a3c5a]">Contribution Types</h2>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">For Guide Writers</h3>
            <p className="text-[#334155]">
              Our Markdown template for guides is available in <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/templates/guide-template.md</code>. Please use this to ensure consistency.
            </p>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">For Developers</h3>
            <p className="text-[#334155]">
              Check the <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/docs/development.md</code> file for setup instructions and coding standards.
            </p>

            <h3 className="text-xl font-bold mt-6 text-[#1a3c5a]">For Researchers</h3>
            <p className="text-[#334155]">
              See <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">/docs/research-guidelines.md</code> for information on documenting EU service alternatives.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#1a3c5a]">Make a Difference Today</h2>
            <p className="text-[#334155] text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              Thank you for helping Europeans take control of their digital lives! Your contribution makes a significant difference to our community.
            </p>
            <Button variant="red" asChild className="mx-auto">
              <Link href="https://github.com/VincentPeters/switch-to.eu" target="_blank" rel="noopener noreferrer">Visit GitHub Repository</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}