export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthTokenResponse = {
  accessToken: string;
  user: AuthUser;
};
