import { ServiceFrontmatter } from '../schemas';
import { ContentParams } from '../common/types';

/**
 * Interface for service retrieval by category
 */
export type ServiceByCategoryFunction = (
    category: string,
    regionFilter?: 'eu' | 'non-eu',
    params?: ContentParams
) => Promise<ServiceFrontmatter[]>;