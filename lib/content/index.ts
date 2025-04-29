// Export schemas
export * from './schemas';

// Export common types
export * from './common/types';

// Export content parsing utilities
export * from './utils/content-parser';
export * from './utils/fs-helpers';
export * from './utils/interop';

// Import modules for dependency injection
import * as ServicesModule from './services';
import * as AlternativesModule from './alternatives';

// Initialize circular dependencies
AlternativesModule.initServiceGetter(ServicesModule.getServicesByCategory);

// Re-export all modules
export * from './guides';
export * from './services';
export * from './categories';
export * from './alternatives';