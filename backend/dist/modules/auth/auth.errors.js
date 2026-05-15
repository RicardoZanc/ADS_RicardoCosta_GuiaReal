export class AuthUnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthUnauthorizedError";
    }
}
