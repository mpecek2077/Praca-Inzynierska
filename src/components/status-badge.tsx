import type { OrderStatus } from "@prisma/client";
import { formatOrderStatus } from "@/lib/order-labels";

const STATUS_CLASS: Record<OrderStatus, string> = {
  NEW: "status-new",
  IN_PROGRESS: "status-progress",
  COMPLETED: "status-done",
  REJECTED: "status-rejected",
};

type StatusBadgeProps = {
  status: OrderStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-pill ${STATUS_CLASS[status]}`}>
      {formatOrderStatus(status)}
    </span>
  );
}
