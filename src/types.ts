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
 * Avatar resource as returned by /avatars
 */
export type Avatar = JsonApiResource<Record<string, any>>;

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

export interface CurrencyRateAttributes {
  from: string;
  to: string;
  rate: number;
}

export type CurrencyRate = JsonApiResource<CurrencyRateAttributes>;

export type CurrencyRatesResponse = ListResponse<CurrencyRate>;

export interface NewsItem {
  id: number;
  title: string;
  body: string;
  published_at: string; // ISO date string
  is_read: boolean;
  // Add any other relevant fields based on the actual API response
}

export type NewsResponse = ListResponse<NewsItem>;

/**
 * Generic single resource response wrapper
 */
export interface ResourceResponse<T> {
  data: T;
  included?: any[];
}

/**
 * Place resource as returned by /places
 */
export type Place = JsonApiResource<Record<string, any>>;
/**
 * Review resource as returned by /reviews
 */
export type Review = JsonApiResource<Record<string, any>>;
/**
 * Search location details as found in Region.attributes.search_location
 */
export interface SearchLocation {
  address: string;
  latitude: number;
  longitude: number;
  viewport: {
    lower_left: { latitude: number; longitude: number };
    upper_right: { latitude: number; longitude: number };
  };
}