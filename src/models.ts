import { Sitter, Avatar, ListResponse, JsonApiResource, Region, Place, SearchLocation, Review } from './types';

/**
 * Wrapper class for Sitter resource with related includes
 */
export class SitterModel {
  /** Raw JSON:API sitter resource */
  readonly data: Sitter;
  /** Included related resources */
  readonly included: Array<Avatar | any>;

  constructor(data: Sitter, included: Array<Avatar | any> = []) {
    this.data = data;
    this.included = included;
  }

  /** Unique identifier of the sitter */
  get id(): string {
    return this.data.id;
  }

  /** Attributes object for the sitter */
  get attributes(): Record<string, any> {
    return this.data.attributes;
  }

  /**
   * Returns the related Avatar resource, if included
   */
  get avatar(): Avatar | undefined {
    const rel = (this.data.relationships?.avatars?.data as Array<{ id: string }> | undefined);
    const ref = Array.isArray(rel) && rel.length > 0 ? rel[0].id : undefined;
    if (!ref) return undefined;
    return this.included.find(
      (res): res is Avatar => res.type === 'avatars' && res.id === ref
    );
  }

  /**
   * Returns the related InaccurateLocation resource, if included
   */
  get inaccurateLocation(): JsonApiResource<Record<string, any>> | undefined {
    const rel = (this.data.relationships?.inaccurate_location?.data as { id: string } | undefined);
    if (!rel?.id) return undefined;
    return this.included.find(
      (res): res is JsonApiResource<Record<string, any>> =>
        res.type === 'inaccurate_locations' && res.id === rel.id
    );
  }

  /**
   * Returns the related MetaTag resource, if included
   */
  get metaTags(): JsonApiResource<Record<string, any>> | undefined {
    const rel = (this.data.relationships?.meta_tags?.data as { id: string } | undefined);
    if (!rel?.id) return undefined;
    return this.included.find(
      (res): res is JsonApiResource<Record<string, any>> =>
        res.type === 'meta_tags' && res.id === rel.id
    );
  }

  /**
   * Factory to wrap a paginated response into SitterModel instances
   */
  static fromListResponse(
    resp: ListResponse<Sitter>
  ): SitterModel[] {
    const inc = resp.included || [];
    return resp.data.map(item => new SitterModel(item, inc));
  }
}

/**
 * Wrapper class for Review resource
 */
export class ReviewModel {
  readonly data: Review;
  constructor(data: Review) {
    this.data = data;
  }

  /** Unique identifier of the review */
  get id(): string {
    return this.data.id;
  }

  /** Attributes object for the review */
  get attributes(): Record<string, any> {
    return this.data.attributes;
  }

  /**
   * Factory to wrap a paginated response into ReviewModel instances
   */
  static fromListResponse(
    resp: ListResponse<Review>
  ): ReviewModel[] {
    return resp.data.map(item => new ReviewModel(item));
  }
}

/**
 * Wrapper class for Region resource with related includes
 */
export class RegionModel {
  readonly data: Region;
  readonly included: Array<Place | any>;

  constructor(data: Region, included: Array<Place | any> = []) {
    this.data = data;
    this.included = included;
  }

  /** Unique identifier of the region */
  get id(): string {
    return this.data.id;
  }

  /** Attributes object for the region */
  get attributes(): Record<string, any> {
    return this.data.attributes;
  }

  /**
   * Returns the related default Place resource, if included
   */
  get defaultPlace(): Place | undefined {
    const rel = (this.data.relationships?.default_place?.data as { id: string } | undefined);
    if (!rel?.id) return undefined;
    return this.included.find(
      (res): res is Place => res.type === 'places' && res.id === rel.id
    );
  }
  
  /**
   * Returns the search location object from attributes
   */
  get searchLocation(): SearchLocation | undefined {
    return this.data.attributes.search_location as SearchLocation;
  }

  /**
   * Factory to wrap a paginated response into RegionModel instances
   */
  static fromListResponse(
    resp: ListResponse<Region>
  ): RegionModel[] {
    const inc = resp.included || [];
    return resp.data.map(item => new RegionModel(item, inc));
  }
}