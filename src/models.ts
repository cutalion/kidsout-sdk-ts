import {
  Sitter, // Sitter is now User
  UserAttributes,
  Avatar,
  ListResponse,
  JsonApiResource,
  Region,
  RegionAttributes,
  Place,
  SearchLocation,
  Review,
  ReviewAttributes,
  IncludedResource,
  InaccurateLocation, // Added for SitterModel
  MetaTag             // Added for SitterModel
} from './types.js';


/**
 * Base model class for JSON:API resources.
 */
export class BaseModel<AttrType, ResType extends JsonApiResource<AttrType>> {
  readonly data: ResType;
  readonly included: Array<IncludedResource>;

  constructor(data: ResType, included: Array<IncludedResource> = []) {
    this.data = data;
    this.included = included;
  }

  /** Unique identifier of the resource */
  get id(): string {
    return this.data.id;
  }

  /** Attributes object for the resource */
  get attributes(): AttrType {
    return this.data.attributes;
  }

  /**
   * Helper to get a related resource from the 'included' array.
   * Handles to-one and to-many (returning the first element) relationships.
   * @param relationshipName The name of the relationship key in `this.data.relationships`.
   * @param expectedType The 'type' string of the expected related resource.
   */
  protected _getRelatedResource<RelType extends IncludedResource>(
    relationshipName: string,
    expectedType: RelType['type']
  ): RelType | undefined {
    const relationship = this.data.relationships?.[relationshipName]?.data;
    if (!relationship) {
      return undefined;
    }

    let resourceIdentifier: { id: string; type: string } | undefined;

    if (Array.isArray(relationship)) {
      // Handle to-many, take the first item if available
      if (relationship.length > 0) {
        resourceIdentifier = relationship[0] as { id: string; type: string };
      }
    } else {
      // Handle to-one
      resourceIdentifier = relationship as { id: string; type: string };
    }

    if (resourceIdentifier && resourceIdentifier.id && resourceIdentifier.type === expectedType) {
      return this.included.find(
        (inc): inc is RelType => inc.id === resourceIdentifier!.id && inc.type === expectedType
      );
    }
    return undefined;
  }
}


/**
 * Wrapper class for Sitter resource with related includes
 */
export class SitterModel extends BaseModel<UserAttributes, Sitter> {
  constructor(data: Sitter, included: Array<IncludedResource> = []) {
    super(data, included);
  }

  // id and attributes getters are inherited

  /**
   * Returns the related Avatar resource, if included
   */
  get avatar(): Avatar | undefined {
    return this._getRelatedResource<Avatar>('avatars', 'avatars');
  }

  /**
   * Returns the related InaccurateLocation resource, if included
   */
  get inaccurateLocation(): InaccurateLocation | undefined {
    return this._getRelatedResource<InaccurateLocation>('inaccurate_location', 'inaccurate_locations');
  }

  /**
   * Returns the related MetaTag resource, if included
   */
  get metaTags(): MetaTag | undefined {
    return this._getRelatedResource<MetaTag>('meta_tags', 'meta_tags');
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

export class CurrencyRateModel {
  public from: string;
  public to: string;
  public rate: number;

  constructor(data: { from: string; to: string; rate: number }) {
    this.from = data.from;
    this.to = data.to;
    this.rate = data.rate;
  }
}

/**
 * Wrapper class for Review resource
 */
export class ReviewModel extends BaseModel<ReviewAttributes, Review> {
  constructor(data: Review, included: Array<IncludedResource> = []) {
    super(data, included);
  }

  // id and attributes getters are inherited

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
export class RegionModel extends BaseModel<RegionAttributes, Region> {
  constructor(data: Region, included: Array<IncludedResource> = []) {
    super(data, included);
  }

  // id and attributes getters are inherited

  /**
   * Returns the related default Place resource, if included
   */
  get defaultPlace(): Place | undefined {
    return this._getRelatedResource<Place>('default_place', 'places');
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
