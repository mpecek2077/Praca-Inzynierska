import type { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/lib/admin-actions";
import { ORDER_STATUS_LABELS } from "@/lib/order-labels";

type AdminOrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

const STATUSES: OrderStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
];

export function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: AdminOrderStatusFormProps) {
  return (
    <form action={updateOrderStatusAction} className="admin-status-form">
      <input type="hidden" name="id" value={orderId} />
      <label>
        Status
        <select name="status" defaultValue={currentStatus}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-secondary">
        Zmień
      </button>
    </form>
  );
}
