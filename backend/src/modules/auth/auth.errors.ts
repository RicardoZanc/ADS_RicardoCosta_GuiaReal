export class AuthUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthUnauthorizedError";
  }
}
