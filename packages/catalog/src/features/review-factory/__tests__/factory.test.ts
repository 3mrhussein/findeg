import { describe, expect, it, vi } from 'vitest';
import { createReviewServices } from '../index';
import { ReviewService } from '../../review-review-service/index';

vi.mock('@findeg/db/queries', () => ({}));

describe('createReviewServices', () => {
  it('bundles a ReviewService as the reviews service', () => {
    expect(createReviewServices().reviews).toBeInstanceOf(ReviewService);
  });
});
