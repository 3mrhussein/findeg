// Public barrel for the notifications feature. Only the factory, its return
// type, and the IEmailService interface (consumed by other backend features,
// e.g. administration) are exported here — NotificationService and
// NotificationEventService are concrete implementation classes and stay
// internal to the backend package. See docs/adr/0001-backend-feature-barrels.md.
export { createNotificationServices } from './application/services/factory';
export type { NotificationServices } from './application/services/factory';
export { default as OrderConfirmationEmail } from './infrastructure/templates/OrderConfirmationEmail';
export { default as OrderStatusUpdateEmail } from './infrastructure/templates/OrderStatusUpdateEmail';
export { default as GuestAccessCodeEmail } from './infrastructure/templates/GuestAccessCodeEmail';
export type { IEmailService } from './application/services/IEmailService';
