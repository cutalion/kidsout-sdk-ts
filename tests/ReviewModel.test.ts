import { describe, it, expect } from 'vitest';
import { ReviewModel } from '../src/models';
import { Review, ListResponse } from '../src/types';

describe('ReviewModel', () => {
  const reviewData: Review = {
    id: 'r1',
    type: 'reviews',
    // Attributes should match ReviewAttributes: rate and body
    attributes: { rate: 1, body: 'Great sitter!' }, 
  };

  it('returns id and attributes correctly', () => {
    const model = new ReviewModel(reviewData);
    expect(model.id).toBe('r1');
    // Ensure the test expects the actual attributes defined in ReviewAttributes
    expect(model.attributes.rate).toBe(1);
    expect(model.attributes.body).toBe('Great sitter!');
  });

  it('fromListResponse wraps data into models', () => {
    const resp: ListResponse<Review> = {
      data: [reviewData],
      included: [],
      meta: { current_page: 1, total: 1, total_pages: 1 },
    };
    const models = ReviewModel.fromListResponse(resp);
    expect(models).toHaveLength(1);
    expect(models[0]).toBeInstanceOf(ReviewModel);
    expect(models[0].id).toBe('r1');
    expect(models[0].attributes.rate).toBe(1); // Changed from rating to rate
  });
});