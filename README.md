# Switch-to.eu

A community-driven platform helping users switch from non-EU digital services to EU alternatives through clear, step-by-step migration guides, promoting digital sovereignty within the European Union.

🌍 **Live Site**: [switch-to.eu](https://switch-to.eu)

## 🚀 About the Project

Switch-to.eu empowers users to regain digital sovereignty by providing:

- **Migration Guides**: Step-by-step instructions to switch from non-EU services to EU alternatives
- **EU Alternative Listings**: Comprehensive database of EU digital services by category
- **Community Contributions**: GitHub-based collaboration for content improvement and expansion
- **Privacy-Focused**: Built with privacy and data sovereignty principles as core values

## 📚 Project Structure

```
/
├── app/            # Next.js App Router directory
│   ├── about/          # About page
│   ├── api/            # API endpoints
│   ├── contribute/     # Contribution pages
│   ├── guides/         # Guide pages
│   ├── search/         # Search functionality
│   └── services/       # Service pages
├── components/     # Reusable UI components
├── content/        # Content in MDX format (git submodule)
│   ├── categories/     # Category definitions and metadata
│   ├── guides/         # Migration guide content
│   ├── services/       # Service definitions and metadata
│   └── templates/      # Templates for new content creation
├── i18n/           # Internationalization files
├── lib/            # Utility functions and content handling
├── public/         # Static assets
└── types/          # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.1 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS v4 with typography plugin
- **Content**: MDX with next-mdx-remote and gray-matter
- **Components**: Radix UI primitives
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Search**: Fuse.js for client-side search capabilities
- **Internationalization**: next-intl
- **Deployment**: Vercel

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can help:

### Content Contributions

1. **Migration Guides**: Create or improve step-by-step guides to switch from non-EU services
2. **Service Listings**: Add or update EU alternative services
3. **Translations**: Help translate content to other EU languages

### Development Contributions

1. **Bug Fixes**: Help us fix issues and improve the platform
2. **Feature Enhancements**: Implement planned features or suggest new ones
3. **UI Improvements**: Enhance the user interface and experience
4. **Accessibility**: Ensure the platform is accessible to all users

### Getting Started

1. Fork the repository
2. Clone your fork and create a new branch
3. Make your changes
4. Submit a pull request with a clear description of your changes

See our [Contribution Guidelines](./CONTRIBUTING.md) for more details.

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/switch-to-eu/switch-to.eu.git
cd switch-to.eu

# Initialize and update the content submodule
git submodule update --init --recursive

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application in your browser.

## 🙏 Acknowledgements

- All contributors who have helped build this platform
- The EU digital services that provide alternatives to non-EU services
- The open-source community for the tools and libraries used in this project
- See [CREDITS.md](./CREDITS.md) for detailed attribution of fonts and other resources used in this project

## 📄 License

This project is open-source and available under the [LICENSE](./LICENSE) terms.