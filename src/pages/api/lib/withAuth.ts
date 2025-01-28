import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtDecode } from "jwt-decode";
import { fetchSiteByUserId } from "@/lib/dynamodb";

type User = {
    id: string;
    name: string;
    email: string;
    sub: string;
};

type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>;

export const withAuth = (handler: ApiHandler): ApiHandler => {
    return async (req: VercelRequest, res: VercelResponse) => {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authorization.split(" ")[1];
        const user = jwtDecode<User>(token);

        (req as any).user = user;

        // For operations that modify data, fetch site and verify admin access
        if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method || "")) {
            const user_id = req.body?.user_id;

            if (!user_id) {
                return res.status(400).json({ error: "Missing user_id" });
            }

            try {
                const site = await fetchSiteByUserId(user_id);
                (req as any).site = site;

                if (user.sub !== site.admin_user_id) {
                    console.log(user.sub, "!==", site.admin_user_id);
                    return res.status(403).json({ error: "Forbidden: You do not have access to modify this resource" });
                }
            } catch (error) {
                console.error("Auth Error:", error);
                return res.status(500).json({ error: "Failed to verify authorization" });
            }
        }

        return handler(req, res);
    };
};
