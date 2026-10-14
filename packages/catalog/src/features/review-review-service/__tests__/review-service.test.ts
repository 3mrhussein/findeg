import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewService } from '../index';

const { reviewQueries, hasPurchasedProduct } = vi.hoisted(() => ({
  reviewQueries: {
    getByProductIdPaginated: vi.fn(),
    getSummaryByProductId: vi.fn(),
    hasUserReviewed: vi.fn(),
    create: vi.fn(),
    recalculateProductAggregates: vi.fn(),
    markHelpful: vi.fn(),
  },
  hasPurchasedProduct: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => ({ reviewQueries, hasPurchasedProduct }));

const summary = { average: 4, count: 2, histogram: { 5: 2 } };

describe('ReviewService', () => {
  let service: ReviewService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new ReviewService();
    reviewQueries.getSummaryByProductId.mockResolvedValue(summary);
  });

  it('pages product reviews with clamped limits and a complete histogram', async () => {
    reviewQueries.getByProductIdPaginated.mockResolvedValue({
      reviews: [{ id: 1, rating: '5' }],
      total: 1,
    });
    const result = await service.getProductReviews(7, { page: 0, limit: 500, verified: true });
    expect(reviewQueries.getByProductIdPaginated).toHaveBeenCalledWith(7, {
      page: 1,
      limit: 50,
      rating: undefined,
      verifiedOnly: true,
    });
    expect(result.reviews[0].rating).toBe(5);
    expect(result.summary.histogram).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 });
  });

  it('uses the default page size when no query is given', async () => {
    reviewQueries.getByProductIdPaginated.mockResolvedValue({ reviews: [], total: 0 });
    const result = await service.getProductReviews(7);
    expect(result).toMatchObject({ page: 1, limit: 10, total: 0 });
  });

  it('reports ineligibility for guests without querying the purchase history', async () => {
    expect(await service.getEligibility(1)).toEqual({
      loggedIn: false,
      hasPurchased: false,
      alreadyReviewed: false,
      canWriteReview: false,
    });
    expect(hasPurchasedProduct).not.toHaveBeenCalled();
  });

  it('computes eligibility for a signed-in buyer who has not reviewed', async () => {
    hasPurchasedProduct.mockResolvedValue(true);
    reviewQueries.hasUserReviewed.mockResolvedValue(false);
    expect(await service.getEligibility(1, 2)).toEqual({
      loggedIn: true,
      hasPurchased: true,
      alreadyReviewed: false,
      canWriteReview: true,
    });
  });

  it('creates a review for an eligible buyer and recalculates aggregates', async () => {
    hasPurchasedProduct.mockResolvedValue(true);
    reviewQueries.hasUserReviewed.mockResolvedValue(false);
    reviewQueries.create.mockResolvedValue({ id: 3, rating: '4' });
    const created = await service.createReview({
      productId: 1,
      userId: 2,
      rating: 4,
      comment: '  nice  ',
    } as never);
    expect(created.rating).toBe(4);
    expect(reviewQueries.create).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'nice', isVerifiedPurchase: true }),
    );
    expect(reviewQueries.recalculateProductAggregates).toHaveBeenCalledWith(1);
  });

  it('rejects invalid ratings, non-buyers and repeat reviews', async () => {
    await expect(
      service.createReview({ productId: 1, userId: 2, rating: 9 } as never),
    ).rejects.toThrow('REVIEW_INVALID_RATING');
    await expect(
      service.createReview({ productId: 1, userId: 2, rating: 'x' } as never),
    ).rejects.toThrow('REVIEW_INVALID_RATING');

    hasPurchasedProduct.mockResolvedValueOnce(false);
    await expect(
      service.createReview({ productId: 1, userId: 2, rating: 3 } as never),
    ).rejects.toThrow('REVIEW_PURCHASE_REQUIRED');

    hasPurchasedProduct.mockResolvedValueOnce(true);
    reviewQueries.hasUserReviewed.mockResolvedValueOnce(true);
    await expect(
      service.createReview({ productId: 1, userId: 2, rating: 3 } as never),
    ).rejects.toThrow('REVIEW_ALREADY_SUBMITTED');
  });

  it('records a helpful vote and rejects blank voters', async () => {
    reviewQueries.markHelpful.mockResolvedValue(4);
    expect(await service.markHelpful(3, ' voter ')).toBe(4);
    expect(reviewQueries.markHelpful).toHaveBeenCalledWith(3, 'voter');
    await expect(service.markHelpful(3, '  ')).rejects.toThrow('REVIEW_INVALID_VOTER');
  });
});
