export enum WorkOrderStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface WorkOrder {
  id: string;
  title: string;
  serviceLocationId: string;
  status: WorkOrderStatus;
}
