import axios, { AxiosInstance } from "axios";
import { Sitter, Perk, Currency, Region, ListResponse, Review, NewsResponse, CurrencyRatesResponse } from './types';

export interface SearchSittersParams {
  date?: string;
  start?: string;
  end?: string;
  kids?: number;
  babies?: boolean;
  kidsout_school?: boolean;
  special_needs?: boolean;
  page?: number;
  per_page?: number;
  perks?: number[];
  min_rate?: number;
  max_rate?: number;
  rate_currency?: string;
  sort?:
    | "experience"
    | "-experience"
    | "rate"
    | "-rate"
    | "age"
    | "-age"
    | "distance"
    | "-return_rate"
    | "-kidsout_score";
  /** Include related resources, e.g. ['avatars','inaccurate_location'] */
  include?: string[];
  /** Sparse fieldsets, e.g. { users: ['name','age'], perks: ['name'] } */
  fields?: Record<string, string[]>;
  online?: boolean;
  region_id?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
  bbox?: {
    bl?: { lat?: number; lon?: number };
    tr?: { lat?: number; lon?: number };
  };
}

export class KidsoutSDK {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = "https://api.kidsout.ru/api/v2") {
    this.axiosInstance = axios.create({ baseURL });
  }

  /**
   * Search for sitters with given parameters.
   * @param params Query parameters for sitter search
   */
  async searchSitters(params: SearchSittersParams = {}): Promise<ListResponse<Sitter>> {
    // Validate and format parameters
    if (params.date && !/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
      throw new Error('Invalid date format; expected YYYY-MM-DD');
    }
    if (params.start && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(params.start)) {
      throw new Error('Invalid start time; expected HH:MM');
    }
    if (params.end && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(params.end)) {
      throw new Error('Invalid end time; expected HH:MM');
    }
    if (params.page != null && (!Number.isInteger(params.page) || params.page < 1)) {
      throw new Error('page must be an integer >= 1');
    }
    if (
      params.per_page != null &&
      (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 1000)
    ) {
      throw new Error('per_page must be an integer between 1 and 1000');
    }
    if (
      params.min_rate != null &&
      (typeof params.min_rate !== 'number' || params.min_rate < 0 || params.min_rate > 10000000)
    ) {
      throw new Error('min_rate must be between 0 and 10000000');
    }
    if (
      params.max_rate != null &&
      (typeof params.max_rate !== 'number' || params.max_rate < 0 || params.max_rate > 10000000)
    ) {
      throw new Error('max_rate must be between 0 and 10000000');
    }
    if (
      params.min_rate != null &&
      params.max_rate != null &&
      params.min_rate > params.max_rate
    ) {
      throw new Error('min_rate cannot be greater than max_rate');
    }
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
    ];
    if (params.sort != null && !allowedSorts.includes(params.sort)) {
      throw new Error(`sort must be one of ${allowedSorts.join(', ')}`);
    }
    if (params.distance != null && params.bbox != null) {
      throw new Error('distance and bbox are mutually exclusive');
    }
    if (params.bbox) {
      const { bl, tr } = params.bbox;
      if (!bl || !tr) {
        throw new Error('bbox must include both bl and tr objects');
      }
      if (bl.lat == null || bl.lon == null) {
        throw new Error('bbox.bl must include lat and lon');
      }
      if (tr.lat == null || tr.lon == null) {
        throw new Error('bbox.tr must include lat and lon');
      }
    }
    // Flatten parameters for query string
    const query: Record<string, any> = { ...params };
    // Handle include parameter (JSON:API)
    if (params.include) {
      query.include = params.include.join(',');
    }
    // Handle fields sparse fieldsets
    if (params.fields) {
      for (const [resource, fieldsArray] of Object.entries(params.fields)) {
        query[`fields[${resource}]`] = (fieldsArray || []).join(',');
      }
      delete query.fields;
    }
    // Handle bbox nested object
    if (params.bbox) {
      const { bbox } = params;
      if (bbox.bl) {
        if (bbox.bl.lat != null) query["bbox[bl][lat]"] = bbox.bl.lat;
        if (bbox.bl.lon != null) query["bbox[bl][lon]"] = bbox.bl.lon;
      }
      if (bbox.tr) {
        if (bbox.tr.lat != null) query["bbox[tr][lat]"] = bbox.tr.lat;
        if (bbox.tr.lon != null) query["bbox[tr][lon]"] = bbox.tr.lon;
      }
      delete query.bbox;
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
    } catch (error: any) {
      // Re-throw a simpler error to avoid circular structures in Jest
      if (axios.isAxiosError(error)) {
        throw new Error(`Axios error fetching news: ${error.message} (status: ${error.response?.status})`);
      }
      throw new Error(`Error fetching news: ${error.message || String(error)}`);
    }
  }

  async getCurrencyRates(base?: string): Promise<CurrencyRatesResponse> {
    const params: { base?: string } = {};
    if (base) {
      params.base = base;
    }
    try {
      const response = await this.axiosInstance.get<CurrencyRatesResponse>(
        '/currencies/rates',
        { params }
      );
      return response.data;
    } catch (error: any) {
      // Re-throw a simpler error to avoid circular structures in Jest
      if (axios.isAxiosError(error)) {
        throw new Error(`Axios error fetching currency rates: ${error.message} (status: ${error.response?.status})`);
      }
      throw new Error(`Error fetching currency rates: ${error.message || String(error)}`);
    }
  }
}

// Export models and types for convenient imports
export { SitterModel, RegionModel, CurrencyRateModel } from './models';
export * from './types';
