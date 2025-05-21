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
// --- Attribute Interfaces ---

export interface UserAttributes {
  first_name?: string;
  last_name?: string | null;
  email?: string | null;
  account_type?: 'sitter' | 'parent' | 'visitor';
  gender?: 'male' | 'female' | null;
  birthday?: string | null; // Date string
  rate?: string | null;
  rate_currency?: string | null;
  experience_years?: number | null;
  work_online?: boolean | null;
  babies?: boolean | null;
  special_needs?: boolean | null;
  about?: string | null;
  education_and_experience?: string | null;
  motivation?: string | null;
  additional_info?: string | null;
  city_id?: number | null;
  region_id?: number | null;
  place_id?: number | null;
  timezone?: string | null;
  // Sitter specific fields from swagger that might be in attributes
  age?: number; // Calculated or directly provided
  kidsout_score?: number;
  kidsout_school?: boolean;
  return_rate?: number;
  views_count?: number;
  invitations_count?: number;
  reviews_count?: number;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
  neutral_reviews_count?: number;
  response_time?: number | null; // In seconds
  [key: string]: any; // Allow other attributes
}

export interface PerkAttributes {
  name?: string;
  group_name?: string | null;
  description?: string | null;
  [key: string]: any;
}

export interface CurrencyAttributes {
  name?: string;
  code?: string; // "RUB", "USD"
  symbol?: string | null;
  [key: string]: any;
}

export interface RegionAttributes {
  name?: string;
  country_code?: string | null;
  currency_code?: string | null;
  timezone?: string | null;
  search_location?: SearchLocation | null; // Keep existing specific types
  default_place_id?: number | null;
  [key: string]: any;
}

export interface AvatarAttributes {
  url?: string;
  variants?: Record<string, { url: string; width?: number; height?: number }> | null;
  [key:string]: any;
}

export interface PlaceAttributes {
  address?: string;
  latitude?: number;
  longitude?: number;
  city_id?: number | null;
  region_id?: number | null;
  country_code?: string | null;
  [key: string]: any;
}

export interface ReviewAttributes {
  rate?: -1 | 0 | 1;
  body?: string | null;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  request_id?: number;
  author_id?: number;
  target_id?: number;
  can_be_edited?: boolean;
  qa?: any | null; // Could be more specific if QA structure is known
  // fields from relationships that might be flattened or present
  author_name?: string; 
  author_avatar_url?: string;
  [key: string]: any;
}

export interface InaccurateLocationAttributes {
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export interface MetaTagAttributes {
  title?: string;
  description?: string;
  keywords?: string;
  [key: string]: any;
}


// --- Resource Types ---
/**
 * User resource (can be Sitter or Parent)
 */
export type User = JsonApiResource<UserAttributes>;
/**
 * Sitter resource, often a specialization of User. For now, using User directly.
 */
export type Sitter = User; // Alias Sitter to User

/**
 * Perk resource as returned by /perks
 */
export type Perk = JsonApiResource<PerkAttributes>;

/**
 * Currency resource as returned by /currencies
 */
export type Currency = JsonApiResource<CurrencyAttributes>;

/**
 * Region resource as returned by /regions
 */
export type Region = JsonApiResource<RegionAttributes>;

/**
 * Avatar resource as returned by /avatars
 */
export type Avatar = JsonApiResource<AvatarAttributes>;

/**
 * Place resource
 */
export type Place = JsonApiResource<PlaceAttributes>;

/**
 * Review resource
 */
export type Review = JsonApiResource<ReviewAttributes>;

/**
 * InaccurateLocation resource
 */
export type InaccurateLocation = JsonApiResource<InaccurateLocationAttributes>;

/**
 * MetaTag resource
 */
export type MetaTag = JsonApiResource<MetaTagAttributes>;


// --- Response and Included Types ---

/**
 * Union type for possible included resources in API responses.
 */
export type IncludedResource = User | Avatar | Place | Perk | Region | Currency | Review | InaccurateLocation | MetaTag;
// Note: Review might not typically be an "included" top-level resource but could be related to a User.
// For now, including it as per the list of resources to type.

/**
 * Generic list response wrapper
 */
export interface ListResponse<T> {
  data: T[];
  included?: IncludedResource[];
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
  included?: IncludedResource[];
}

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