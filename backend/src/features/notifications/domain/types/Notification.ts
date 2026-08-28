export interface Notification {
  id: number;
  userId: number;
  titleEn: string;
  titleAr: string;
  bodyEn?: string | null;
  bodyAr?: string | null;
  actionUrl?: string | null;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: number;
  titleEn: string;
  titleAr: string;
  bodyEn?: string | null;
  bodyAr?: string | null;
  actionUrl?: string | null;
  type: string;
  isRead?: boolean;
  createdAt?: Date;
}