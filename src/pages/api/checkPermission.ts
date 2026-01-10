import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "./lib/withAuth";
import { fetchSiteByUserId } from "@/lib/dynamodb";

const checkPermissionHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id } = req.query;

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  const user = (req as any).user;

  try {
    const site = await fetchSiteByUserId(user_id);
    const hasPermission = user.sub === site.admin_user_id;

    return res.status(200).json({ 
      hasPermission,
      user_id,
      admin_user_id: site.admin_user_id,
    });
  } catch (error) {
    console.error("Permission check error:", error);
    return res.status(500).json({ error: "Failed to check permissions" });
  }
};

export default withAuth(checkPermissionHandler);
