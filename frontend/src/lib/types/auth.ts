export type AuthUser = {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
};

export type AuthTokenResponse = {
  accessToken: string;
  user: AuthUser;
};
