# Switch-to.eu Library Directory

This directory contains core utility functions and modules for the Switch-to.eu application.

## Content Module

The content module (`lib/content`) provides an API for accessing and manipulating content stored in the `content/` directory of the project. It follows a modular architecture to improve maintainability and organization.

### Overview

```
lib/
├── content.ts            # Legacy entry point (re-exports everything)
├── content/              # Content module directory
│   ├── index.ts          # Main entry point
│   ├── schemas/          # Zod validation schemas
│   ├── common/           # Shared types and interfaces
│   ├── utils/            # Utility functions
│   ├── guides/           # Guide-related functions
│   ├── services/         # Service-related functions
│   ├── categories/       # Category-related functions
│   └── alternatives/     # Alternatives-related functions
├── search.ts             # Search functionality
├── redis.ts              # Redis utilities
├── types.ts              # Global type definitions
└── utils.ts              # General utility functions
```

### Modules

#### Schemas (`content/schemas/`)

Contains Zod validation schemas for frontmatter data and type definitions derived from these schemas. Provides type guards for runtime type checking.

```typescript
import { ServiceFrontmatter, isServiceFrontmatter } from '@/lib/content/schemas';
```

#### Common Types (`content/common/`)

Contains shared types and interfaces used across the content module.

```typescript
import { ContentParams, ContentSegments } from '@/lib/content/common/types';
```

#### Utilities (`content/utils/`)

- `fs-helpers.ts`: File system utility functions
- `content-parser.ts`: Functions for parsing and extracting data from markdown content
- `interop.ts`: Type definitions for module interoperability and dependency injection

```typescript
import { getLanguageContentPath } from '@/lib/content/utils/fs-helpers';
import { loadMarkdownFile } from '@/lib/content/utils/content-parser';
```

#### Content Type Modules

Each content type has its own module with functions specific to that type:

- `guides/`: Managing migration guide content
- `services/`: Managing service information
- `categories/`: Managing category metadata
- `alternatives/`: Managing service alternatives collections

```typescript
import { getGuidesByCategory } from '@/lib/content/guides';
import { getServiceBySlug } from '@/lib/content/services';
import { getCategoryMetadata } from '@/lib/content/categories';
import { getAlternativesByCategory } from '@/lib/content/alternatives';
```

### Usage

#### Importing Content Functions

You can import specific functions from the main `lib/content` module:

```typescript
import { getGuidesByCategory, getServiceBySlug } from '@/lib/content';
```

Or import directly from the specific submodule for more clarity:

```typescript
import { getGuidesByCategory } from '@/lib/content/guides';
import { getServiceBySlug } from '@/lib/content/services';
```

#### Working with ContentParams

Most functions accept a `ContentParams` parameter which can be either:

1. A string representing the language code:
   ```typescript
   const guides = await getGuidesByCategory('email', 'en');
   ```

2. An object with a lang property:
   ```typescript
   const guides = await getGuidesByCategory('email', { lang: 'en' });
   ```

This dual format supports both legacy code and new implementations.

## Other Modules

- `search.ts`: Provides search functionality across content types
- `redis.ts`: Redis client and utilities for caching
- `types.ts`: Global type definitions
- `utils.ts`: General utility functions for the application