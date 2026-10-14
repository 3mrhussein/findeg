/** Notification delivery and event-to-delivery composition. Account inbox operations are owned by Identity. */
export { createNotificationServices } from './application/services/factory';
export type { NotificationServices } from './application/services/factory';
export { default as OrderConfirmationEmail } from './infrastructure/templates/OrderConfirmationEmail';
export { default as OrderStatusUpdateEmail } from './infrastructure/templates/OrderStatusUpdateEmail';
export { default as GuestAccessCodeEmail } from './infrastructure/templates/GuestAccessCodeEmail';
export { default as PartnerInvitationEmail } from './infrastructure/templates/PartnerInvitationEmail';
export type { IEmailService } from './application/services/IEmailService';

export * from './contracts';
