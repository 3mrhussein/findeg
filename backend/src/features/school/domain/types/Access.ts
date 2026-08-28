export interface SchoolListAccessGrant {
  id: number;
  listId: number;
  userId: number;
  grantedVia: string;
  grantedAt: Date;
  expiresAt: Date | null;
}

export interface CreateSchoolListAccessGrantInput {
  listId: number;
  userId: number;
  grantedVia: string;
  expiresAt?: Date | null;
}

export interface SchoolListAccessRequest {
  id: number;
  listId: number;
  userId: number;
  childName: string | null;
  note: string | null;
  parentName: string;
  parentEmail: string;
  status: string;
  reviewedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolListAccessRequestInput {
  listId: number;
  userId: number;
  childName?: string;
  note?: string;
  parentName: string;
  parentEmail: string;
  status: string;
  reviewedBy?: number | null;
}

export interface SchoolListAccessToken {
  id: number;
  listId: number;
  token: string;
  label: string | null;
  maxUses: number | null;
  useCount: number;
  expiresAt: Date | null;
  createdBy: number | null;
  createdAt: Date;
}

export interface SchoolListCodeAttempt {
  id: number;
  listId: number;
  userId: number;
  attemptCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}