export type AdminRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminRequestEligibilityReason =
  | "ALREADY_ADMIN"
  | "PENDING_REQUEST"
  | "COOLDOWN"
  | "LOW_REPUTATION"
  | "BANNED";

export type AdminRequestEligibility = {
  can_request: boolean;
  reason?: AdminRequestEligibilityReason;
  cooldown_ends_at?: string;
  min_reputation: number;
};

export type AdminRequestUser = {
  id: string;
  username: string;
  reputation_score: number;
};

export type AdminRequestItem = {
  id: string;
  message: string;
  status: AdminRequestStatus | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user: AdminRequestUser;
  reviewer: { id: string; username: string } | null;
};

export type MyAdminRequestsResponse = {
  requests: AdminRequestItem[];
  eligibility: AdminRequestEligibility;
};

export type AdminRequestsListResponse = {
  data: AdminRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateAdminRequestPayload = {
  message: string;
};

export type UpdateAdminRequestPayload = {
  status: "APPROVED" | "REJECTED";
  rejection_reason?: string;
};
