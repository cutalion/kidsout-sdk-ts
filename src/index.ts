import axios, { AxiosInstance, AxiosError } from "axios";
import { z } from 'zod';
import { Sitter, Perk, Currency, Region, ListResponse, Review, NewsResponse, CurrencyRatesResponse } from './types';
import { KidsoutApiError, KidsoutValidationError } from './errors';

const allowedSorts = [
  'experience',
  '-experience',
  'rate',
  '-rate',
  'age',
  '-age',
  'distance',
  '-return_rate',
  '-kidsout_score',
] as const;

const SearchSittersParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format; expected YYYY-MM-DD").optional(),
  start: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid start time; expected HH:MM").optional(),
  end: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid end time; expected HH:MM").optional(),
  kids: z.number().int().min(0).optional(), // Assuming kids can be 0 or more
  babies: z.boolean().optional(),
  kidsout_school: z.boolean().optional(),
  special_needs: z.boolean().optional(),
  page: z.number().int().min(1, "page must be an integer >= 1").optional(),
  per_page: z.number().int().min(1).max(1000, "per_page must be an integer between 1 and 1000").optional(),
  perks: z.array(z.number().int()).optional(),
  min_rate: z.number().min(0).max(10000000, "min_rate must be between 0 and 10000000").optional(),
  max_rate: z.number().min(0).max(10000000, "max_rate must be between 0 and 10000000").optional(),
  rate_currency: z.string().optional(),
  sort: z.enum(allowedSorts).optional(),
  include: z.array(z.string()).optional(),
  fields: z.record(z.array(z.string())).optional(),
  online: z.boolean().optional(),
  region_id: z.number().int().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distance: z.number().min(0).optional(),
  bbox: z.object({
    bl: z.object({ lat: z.number(), lon: z.number() }),
    tr: z.object({ lat: z.number(), lon: z.number() }),
  }).optional(),
})
  .refine(data => data.min_rate === undefined || data.max_rate === undefined || data.min_rate <= data.max_rate, {
    message: "min_rate cannot be greater than max_rate",
    path: ["min_rate"],
  })
  .refine(data => !(data.distance !== undefined && data.bbox !== undefined), {
    message: "distance and bbox are mutually exclusive",
    path: ["distance"], // Or path: ["bbox"] or a general path
  });
// The superRefine for individual bbox.bl/tr presence and their lat/lon content
// is handled by the schema definition:
// bbox: z.object({
//   bl: z.object({ lat: z.number(), lon: z.number() }), // lat/lon required if bl present
//   tr: z.object({ lat: z.number(), lon: z.number() }), // lat/lon required if tr present
// }).optional()
// If bbox is provided, 'bl' and 'tr' must be objects satisfying their respective schemas.

export type SearchSittersParams = z.infer<typeof SearchSittersParamsSchema>;

// The original interface SearchSittersParams is now replaced by the Zod inferred type.
// We keep the export of the type, but the interface definition itself is removed.
// export interface SearchSittersParams { // This was removed in the previous step correctly
//   date?: string;
//   // start?: string;
//   end?: string;
//   kids?: number;
//   babies?: boolean;
//   kidsout_school?: boolean;
//   special_needs?: boolean;
//   page?: number;
//   per_page?: number;
//   perks?: number[];
//   min_rate?: number;
//   max_rate?: number;
//   rate_currency?: string;
//   sort?:
//     | "experience"
//     | "-experience"
//     | "rate"
//     | "-rate"
//     | "age"
//     | "-age"
//     | "distance"
//     | "-return_rate"
//     | "-kidsout_score";
//   /** Include related resources, e.g. ['avatars','inaccurate_location'] */
//   include?: string[];
//   /** Sparse fieldsets, e.g. { users: ['name','age'], perks: ['name'] } */
//   fields?: Record<string, string[]>;
//   online?: boolean;
//   region_id?: number;
//   latitude?: number;
//   longitude?: number;
//   distance?: number;
//   bbox?: {
//     bl?: { lat?: number; lon?: number };
//     tr?: { lat?: number; lon?: number };
//   };
// }

/**
 * KidsoutSDK is the main class for interacting with the Kidsout API.
 * It provides methods for accessing various API endpoints, handling authentication,
 * and processing responses. Supports API key authentication and detailed error handling.
 */
export class KidsoutSDK {
  private axiosInstance: AxiosInstance;

  /**
   * Creates an instance of KidsoutSDK.
   * @param baseURL The base URL for the Kidsout API. Defaults to "https://api.kidsout.ru/api/v2".
   * @param apiKey Optional API key. If provided, it will be used to set the 'Authorization: Bearer <apiKey>' header for all requests.
   */
  constructor(baseURL: string = "https://api.kidsout.ru/api/v2", apiKey?: string) {
    this.axiosInstance = axios.create({ baseURL });

    if (apiKey) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }

    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          const status = error.response?.status;
          return Promise.reject(new KidsoutApiError(message, status, error));
        }
        return Promise.reject(new KidsoutApiError(error.message, undefined, error));
      }
    );
  }

  /**
   * Search for sitters with given parameters.
   * @param params Query parameters for sitter search.
   * @example
   * // Include sitters' avatars
   * sdk.searchSitters({ include: ['avatars'] })
   *   .then(response => {
   *     const sitters = SitterModel.fromListResponse(response); // Assuming SitterModel usage
   *     if (sitters[0] && sitters[0].avatar) {
   *       console.log(sitters[0].avatar.attributes.url);
   *     }
   *   });
   * @example
   * // Request only name and age for sitters (users), and only name for perks
   * sdk.searchSitters({ fields: { users: ['first_name', 'age'], perks: ['name'] } })
   *   .then(response => console.log(response.data[0].attributes));
   */
  async searchSitters(params: SearchSittersParams = {}): Promise<ListResponse<Sitter>> {
    const validationResult = SearchSittersParamsSchema.safeParse(params);

    if (!validationResult.success) {
      const issues = validationResult.error.errors.map(e => `${e.path.join('.') || 'parameter'}: ${e.message}`);
      throw new KidsoutValidationError('Invalid search parameters', issues);
    }

    const validatedParams = validationResult.data;

    // Flatten parameters for query string
    const query: Record<string, any> = { ...validatedParams };

    // Handle include parameter (JSON:API)
    if (validatedParams.include) {
      query.include = validatedParams.include.join(',');
    }

    // Handle fields sparse fieldsets
    if (validatedParams.fields) {
      for (const [resource, fieldsArray] of Object.entries(validatedParams.fields)) {
        query[`fields[${resource}]`] = (fieldsArray || []).join(',');
      }
      delete query.fields; // remove the object form
    }

    // Handle bbox nested object
    if (validatedParams.bbox) {
      const { bbox } = validatedParams;
      if (bbox.bl) {
        if (bbox.bl.lat != null) query["bbox[bl][lat]"] = bbox.bl.lat;
        if (bbox.bl.lon != null) query["bbox[bl][lon]"] = bbox.bl.lon;
      }
      if (bbox.tr) {
        if (bbox.tr.lat != null) query["bbox[tr][lat]"] = bbox.tr.lat;
        if (bbox.tr.lon != null) query["bbox[tr][lon]"] = bbox.tr.lon;
      }
      delete query.bbox; // remove the object form
    }

    const response = await this.axiosInstance.get<ListResponse<Sitter>>("/search", { params: query });
    return response.data;
  }

  /**
   * List available regions.
   */
  async getRegions(): Promise<ListResponse<Region>> {
    const response = await this.axiosInstance.get<ListResponse<Region>>('/regions');
    return response.data;
  }

  /**
   * List available currencies.
   */
  async getCurrencies(): Promise<ListResponse<Currency>> {
    const response = await this.axiosInstance.get<ListResponse<Currency>>('/currencies');
    return response.data;
  }

  /**
   * List available perks.
   */
  async getPerks(): Promise<ListResponse<Perk>> {
    const response = await this.axiosInstance.get<ListResponse<Perk>>('/perks');
    return response.data;
  }

  /**
   * Get reviews with optional filters. At least one of `user_id` or `token` should be provided.
   */
  async getReviews(
    params: {
      token?: string;
      user_id?: number;
      page?: number;
      per_page?: number;
      before?: number;
    } = {}
  ): Promise<ListResponse<Review>> {
    const response = await this.axiosInstance.get<ListResponse<Review>>(
      '/reviews',
      { params }
    );
    return response.data;
  }

  async getNews(
    params: {
      page?: number;
      per_page?: number;
      before?: number; // timestamp
    } = {}
  ): Promise<NewsResponse> {
    try {
      const response = await this.axiosInstance.get<NewsResponse>(
        '/news',
        { params }
      );
      return response.data;
    } catch (error) {
      if (error instanceof KidsoutApiError) {
        throw error;
      }
      // For non-KidsoutApiError, wrap it or handle as a new KidsoutApiError
      // This part depends on whether the interceptor already wrapped it.
      // Assuming the interceptor handles AxiosErrors, other errors might still occur.
      const message = error instanceof Error ? error.message : String(error);
      throw new KidsoutApiError(message, undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get currency rates.
   * @param params Optional parameters.
   * @param params.base Optional base currency code (e.g., "USD"). If not provided, API default will be used.
   */
  async getCurrencyRates(params: { base?: string } = {}): Promise<CurrencyRatesResponse> {
    const queryParams: { base?: string } = {};
    if (params.base) {
      queryParams.base = params.base;
    }
    try {
      const response = await this.axiosInstance.get<CurrencyRatesResponse>(
        '/currencies/rates',
        { params: queryParams }
      );
      return response.data;
    } catch (error) {
      if (error instanceof KidsoutApiError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new KidsoutApiError(message, undefined, error instanceof Error ? error : undefined);
    }
  }
}

// Export models and types for convenient imports
export { SitterModel, RegionModel, CurrencyRateModel } from './models';
export * from './types';
// Do not export SearchSittersParams, it's an internal type now inferred from Zod schema
// export type { SearchSittersParams } from './index'; // This line would cause issues if SearchSittersParams is redefined
export { KidsoutApiError, KidsoutValidationError } from './errors';
