import { ReviewModel } from '../src/models';
import { Review, ListResponse } from '../src/types';

describe('ReviewModel', () => {
  const reviewData: Review = {
    id: 'r1',
    type: 'reviews',
    attributes: { rating: 5, comment: 'Great sitter!' },
  };

  it('returns id and attributes correctly', () => {
    const model = new ReviewModel(reviewData);
    expect(model.id).toBe('r1');
    expect(model.attributes).toEqual({ rating: 5, comment: 'Great sitter!' });
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
    expect(models[0].attributes.rating).toBe(5);
  });
});