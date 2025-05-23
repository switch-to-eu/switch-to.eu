# Switch-to.eu

A community-driven platform helping users switch from non-EU digital services to EU alternatives through clear, step-by-step migration guides.

🌍 **Live Site**: [switch-to.eu](https://switch-to.eu)

## 🚀 About the Project

Switch-to.eu empowers users to regain digital sovereignty by providing:

- **Migration Guides**: Step-by-step instructions to switch from non-EU services to EU alternatives
- **EU Alternative Listings**: Comprehensive database of EU digital services by category
- **Community Contributions**: GitHub-based collaboration for content improvement and expansion

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
├── content/        # Content in MDX format -> sub git module
│   ├── categories/     # Category definitions and metadata
│   ├── guides/         # Migration guide content
│   ├── services/       # Service definitions and metadata
│   └── templates/      # Templates for new content creation
├── lib/            # Utility functions and content handling
├── public/         # Static assets
└── types/          # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.2.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with typography plugin
- **Content**: MDX with next-mdx-remote and gray-matter
- **Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can help:


### Development Contributions

1. **Bug Fixes**: Help us fix issues and improve the platform
2. **Feature Enhancements**: Implement planned features or suggest new ones
3. **UI Improvements**: Enhance the user interface and experience

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

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🙏 Acknowledgements

- All contributors who have helped build this platform
- The EU digital services that provide alternatives to non-EU services
- The open-source community for the tools and libraries used in this project
- See [CREDITS.md](./CREDITS.md) for detailed attribution of fonts and other resources used in this project