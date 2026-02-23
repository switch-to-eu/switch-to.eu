# Content Module Refactoring

This document explains the refactoring of the `content.ts` file into a more modular and maintainable structure.

## Overview

The original `content.ts` file was a monolithic module containing all content-related functionality, including schemas, types, utility functions, and service-specific functions. It had grown too large and complex, making it difficult to maintain and understand.

The refactoring breaks down the functionality into smaller, focused modules with clear responsibilities:

## Directory Structure

```
lib/content/
├── index.ts                  # Main entry point that re-exports everything
├── types/                    # Type definitions
│   └── index.ts              # Exports type interfaces and type aliases
├── schemas/                  # Zod schema definitions
│   └── index.ts              # Exports all schema objects
├── utils/                    # Utility functions
│   └── index.ts              # Exports utility functions like content extractors
└── services/                 # Service-specific modules
    ├── index.ts              # Re-exports all service modules
    ├── guides.ts             # Guide-related functions
    ├── alternatives.ts       # Alternative services functions
    ├── categories.ts         # Category-related functions
    └── services.ts           # Service-related functions
```

## Modules and Responsibilities

### Types (`types/index.ts`)

Contains TypeScript type definitions used throughout the content module, including:
- `ContentSegments` interface for parsed content sections
- Type aliases derived from Zod schemas (e.g., `GuideFrontmatter`)

### Schemas (`schemas/index.ts`)

Contains Zod schema definitions for validation, including:
- `GuideFrontmatterSchema`
- `AlternativesFrontmatterSchema`
- `ServiceFrontmatterSchema`
- `CategoryMetadataSchema`

### Utils (`utils/index.ts`)

Contains utility functions that:
- Provide file path handling (`getLanguageContentPath`)
- Validate frontmatter data with type guards
- Extract and process content (segments, issues, steps, features)

### Services

Service-specific modules in the `services/` directory:

#### Guides (`services/guides.ts`)

Functions for working with guides:
- `getGuideCategories`
- `getGuidesByCategory`
- `getGuide`
- `getAllGuides`
- `getGuidesByTargetService`

#### Alternatives (`services/alternatives.ts`)

Functions for working with alternative services:
- `getAlternativesByCategory`
- `getAlternativesCategories`

#### Categories (`services/categories.ts`)

Functions for working with categories:
- `getCategoryMetadata`
- `getAllCategoriesMetadata`
- `getCategoryContent`

#### Services (`services/services.ts`)

Functions for working with services:
- `getAllServices`
- `getEUServices` / `getNonEUServices`
- `getServicesByCategory`
- `getServiceBySlug`
- `getFeaturedServices`
- `getServiceSlugs`
- `getRecommendedAlternative`

## Main Entry Point (`index.ts`)

Provides a unified API by re-exporting all the modules. Consumers can still import everything from the main `content` module without changing their code.

## Benefits of This Refactoring

1. **Improved maintainability**: Smaller files with clear responsibilities
2. **Better organization**: Related functions grouped together
3. **Easier testing**: Modules can be tested independently
4. **Reduced cognitive load**: Developers can focus on one aspect at a time
5. **Backward compatibility**: API remains the same through re-exports

## Usage Example

The refactored module can be used the same way as before:

```typescript
import {
  getGuidesByCategory,
  getServiceBySlug,
  extractContentSegments
} from '@/lib/content';
```

Or you can directly import from specific submodules if preferred:

```typescript
import { getGuidesByCategory } from '@/lib/content/services/guides';
import { extractContentSegments } from '@/lib/content/utils';
```