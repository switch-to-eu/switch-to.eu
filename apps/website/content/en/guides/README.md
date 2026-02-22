# Guide Contributor's Documentation

Welcome to the Switch-to.EU guides documentation! This README provides everything you need to know about creating and maintaining migration guides for EU service alternatives.

## Guide Structure

Each migration guide should be placed in its appropriate category directory and follow this structure:

```
/content/guides/[category]/[service-name]/
├── index.md          # The main guide content
└── images/            # Images folder for screenshots and diagrams
    ├── step1.png
    ├── step2.png
    └── ...
```

## Guide Categories

Guides are organized by service category:

- `email` - Email services
- `storage` - Cloud storage services
- `messaging` - Chat and messaging applications
- `productivity` - Office and productivity tools
- `analytics` - Analytics and tracking tools

## Content Segmentation

Our platform supports logical content segmentation within MDX files. This makes content more maintainable and provides a better structure for guides while remaining readable in standard markdown editors.

### Segmentation Format

To segment your content, use the following syntax:

```md
---section:sectionname
Your markdown content goes here.
Content can span multiple paragraphs.
---
```

### Standard Sections

We recommend using these standard section names for guides:

- `intro`: Introduction and overview of the migration
- `before`: Prerequisites and preparation steps
- `steps`: The step-by-step migration process
- `troubleshooting`: Common issues and solutions
- `outro`: Conclusion and final notes

### Example of Segmented Content

Here's how a segmented guide should be structured:

```md
---
title: 'Migrating from Service A to Service B'
description: 'Step-by-step guide for moving from Service A to Service B'
difficulty: 'beginner'
timeRequired: '30 minutes'
sourceService: 'Service A'
targetService: 'Service B'
date: '2025-04-08'
author: 'Switch-to.EU Team'
---

---section:intro
# Migrating from Service A to Service B

Service B is a secure EU-based alternative to Service A. This guide will help you migrate your data.

## Why Switch to Service B?

Key benefits of Service B include:
- EU-based infrastructure
- Enhanced privacy features
- GDPR compliance
---

---section:before
## Before You Begin

### Prerequisites
- An active Service A account
- A computer with internet access
- Approximately 30 minutes of time

### What You'll Need
- A secure password for your new Service B account
---

---section:steps
## Step 1: Create a Service B Account

1. Visit Service B's website
2. Click on "Sign Up"
3. Enter your details and create your account

## Step 2: Export Your Data from Service A

1. Log in to Service A
2. Go to Settings
3. Find the Export option and download your data
---

---section:troubleshooting
## Troubleshooting

### Common Issues
- **Login problems**: Make sure your credentials are correct
- **Missing data**: Check if all data was properly exported

### Getting Help
If you encounter issues, contact Service B's support team
---

---section:outro
## Conclusion

Congratulations! You've successfully migrated from Service A to Service B.

Remember to update your login information on other services that might be linked.
---
```

### Backward Compatibility

The segmentation system is backward-compatible. Non-segmented content will continue to work correctly. If you're updating existing guides, consider adding segmentation to improve maintainability.

## Creating a New Guide

To create a new migration guide:

1. Identify the appropriate category for your guide
2. Create a new folder with a descriptive name (e.g., `gmail-to-protonmail`)
3. Copy the template from `/content/templates/guide-template.md`
4. Fill in all sections of the template
5. Add screenshots to the images folder

## Frontmatter Structure

Each guide should include frontmatter at the top of the MDX file with the following fields:

```mdx
---
title: "Migrating from [Service A] to [Service B]"
description: "A step-by-step guide to help you migrate from [Service A] to [Service B], an EU-based alternative."
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
author: "Your Name"
difficulty: "beginner|intermediate|advanced"
timeRequired: "X minutes|hours"
sourceService: "Service A"
targetService: "Service B"
sourceServiceUrl: "https://example.com"
targetServiceUrl: "https://eu-example.eu"
---
```

## Writing Guidelines

To ensure consistency across all guides:

1. **Be Clear and Concise** - Use simple language and short sentences
2. **Step-by-Step Format** - Number each step clearly and include screenshots
3. **Highlight Differences** - Note key differences between the source and target services
4. **Include Troubleshooting** - Add a section for common issues and solutions
5. **Keep It Current** - Update guides when services change

## Testing Your Guide

Before submitting a guide:

1. Follow your own instructions from start to finish
2. Test on different devices and browsers if relevant
3. Have someone else review and test the guide

Thank you for contributing to Switch-to.EU and helping users migrate to EU services!