/**
 * Generic JSON:API resource wrapper
 */
export interface JsonApiResource<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, any>;
}

/**
 * Sitter resource as returned by /search
 */
export type Sitter = JsonApiResource<Record<string, any>>;

/**
 * Perk resource as returned by /perks
 */
export type Perk = JsonApiResource<Record<string, any>>;

/**
 * Currency resource as returned by /currencies
 */
export type Currency = JsonApiResource<Record<string, any>>;

/**
 * Region resource as returned by /regions
 */
export type Region = JsonApiResource<Record<string, any>>;

/**
 * Generic list response wrapper
 */
export interface ListResponse<T> {
  data: T[];
  included?: any[];
  meta: {
    current_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Generic single resource response wrapper
 */
export interface ResourceResponse<T> {
  data: T;
  included?: any[];
}