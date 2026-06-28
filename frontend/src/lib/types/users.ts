export type UserProfile = {
  id: string;
  username: string;
  reputation_score: number;
  avatar_url: string | null;
  created_at: string;
  email?: string | null;
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
