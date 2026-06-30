export type UserInterest = {
  id: string;
  name: string;
  type: "TIPO" | "CATEGORIA";
  parent_id: string | null;
};

export type UserProfile = {
  id: string;
  username: string;
  reputation_score: number;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  email?: string | null;
  interests: UserInterest[];
};

export type UserInteractionContext = {
  kind: "product" | "node";
  id: string;
  name: string;
};

export type UserInteraction = {
  id: string;
  kind: "opinion" | "thread";
  content: string;
  created_at: string;
  context: UserInteractionContext;
};

export type UserInteractionsResponse = {
  data: UserInteraction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
