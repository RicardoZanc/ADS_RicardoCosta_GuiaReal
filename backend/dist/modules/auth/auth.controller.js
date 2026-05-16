import { authService } from "./auth.service";
const authController = {
    signup: async (req, res) => {
        const user = await authService.signup(req.body);
        res.status(201).json(user);
    },
    login: async (req, res) => {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    },
    refresh: async (req, res) => {
        const result = await authService.refreshAccessToken(req.body);
        res.status(200).json(result);
    },
};
export { authController };
