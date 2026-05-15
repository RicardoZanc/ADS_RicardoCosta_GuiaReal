import { authService } from "./auth.service";
import { AuthUnauthorizedError } from "./auth.errors";
const authController = {
    signup: async (req, res) => {
        try {
            const user = await authService.signup(req.body);
            res.status(201).json(user);
        }
        catch (err) {
            if (err instanceof Error && err.message === "User already exists") {
                return res.status(409).json({
                    status: "error",
                    message: err.message,
                });
            }
            throw err;
        }
    },
    login: async (req, res) => {
        try {
            const result = await authService.login(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof AuthUnauthorizedError) {
                return res.status(401).json({
                    status: "error",
                    message: err.message,
                });
            }
            throw err;
        }
    },
    refresh: async (req, res) => {
        try {
            const result = await authService.refreshAccessToken(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof AuthUnauthorizedError) {
                return res.status(401).json({
                    status: "error",
                    message: err.message,
                });
            }
            throw err;
        }
    },
};
export { authController };
