import { NextApiRequest, NextApiResponse } from "next";
import { fetchSiteByDomain } from "@/lib/dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const host = req.headers.host;
    if (!host) {
        return res.status(400).json({ error: "Host header is missing" });
    }

    try {
        const site = await fetchSiteByDomain(host);
        return res.status(200).json(site);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch site configuration" });
    }
}
