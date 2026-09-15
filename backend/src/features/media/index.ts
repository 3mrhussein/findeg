// Public barrel for the media feature. Only types/DTOs are exported here —
// MediaService is a concrete implementation class and stays internal to the
// backend package. See docs/adr/0001-backend-feature-barrels.md.
export type { MediaAsset } from './domain/entities/MediaAsset';
