import { VercelRequest, VercelResponse } from "@vercel/node";
import { Site } from "@/types/core";
import { ApiResponse } from "@/types/api";
import { fetchSiteByContext } from "@/lib/dynamodb";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const site = await fetchSiteByContext({ req: { headers: req.headers } });
    res.status(200).json({ data: site });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch site configuration" });
  }
};

export default handler;
