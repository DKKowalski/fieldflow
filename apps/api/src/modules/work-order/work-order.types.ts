export enum WorkOrderStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface WorkOrder {
  id: string;
  title: string;
  customerId: string;
  status: WorkOrderStatus;
}
