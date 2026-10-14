/** The signed-in Staff member changing an Order from the Dashboard. */
export interface OrderStaffActor {
  kind: 'staff';
  userId: number;
  userName?: string;
  permissionCodes?: readonly string[];
  activeRoleIds?: readonly string[];
}
