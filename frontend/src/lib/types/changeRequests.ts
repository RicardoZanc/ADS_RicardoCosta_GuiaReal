export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ChangeEntityType = "NODE" | "PRODUCT";

export type ChangeRequestDiffEntry = {
  field: string;
  label: string;
  from: string;
  to: string;
};

export type ChangeRequestUser = {
  id: string;
  username: string;
};

export type ChangeRequestItem = {
  id: string;
  entity_type: ChangeEntityType;
  entity_id: string;
  entity_label: string;
  changes: Record<string, unknown>;
  previous_state: Record<string, unknown>;
  diff: ChangeRequestDiffEntry[];
  status: ChangeRequestStatus | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user: ChangeRequestUser;
  reviewer: ChangeRequestUser | null;
};

export type MyChangeRequestsResponse = {
  requests: ChangeRequestItem[];
};

export type ChangeRequestsListResponse = {
  data: ChangeRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateChangeRequestPayload = {
  status: "APPROVED" | "REJECTED";
  rejection_reason?: string;
};
