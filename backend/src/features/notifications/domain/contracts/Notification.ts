export interface Notification {
  id: number;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  titleEn: string;
  titleAr: string;
  bodyEn?: string;
  bodyAr?: string;
}
