export interface SchoolListParentSession {
  id: number;
  listId: number;
  userId: number | null;
  sessionToken: string | null;
  itemSelections: Record<string, unknown>;
  optionalInclusions: number[];
  optionalExclusions: number[];
  updatedAt: Date;
  createdAt: Date;
}

export interface UpsertSchoolListParentSessionInput {
  listId: number;
  userId?: number | null;
  sessionToken?: string | null;
  itemSelections?: Record<string, unknown>;
  optionalInclusions?: number[];
  optionalExclusions?: number[];
  updatedAt?: Date;
  createdAt?: Date;
}
