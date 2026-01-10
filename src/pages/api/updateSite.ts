import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "./lib/withAuth";
import { getRepository } from "@/lib/storage/repositoryFactory";
import { findSiteByUserId } from "@/lib/getSite";
import { getConfig } from "@/lib/dynamodb";

const updateSiteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user_id, info } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const repository = getRepository();
    const config = await repository.getConfig();
    
    // Verify the site exists
    const site = findSiteByUserId(config, user_id);
    
    // Find the site in the config and update it
    const siteIndex = config.sites.findIndex(s => s.user_id === user_id);
    if (siteIndex === -1) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Update the info field
    if (info !== undefined) {
      config.sites[siteIndex].info = info;
    }

    // Update the config
    await repository.updateConfig(config);

    // Return the updated site
    const updatedSite = findSiteByUserId(config, user_id);
    res.status(200).json(updatedSite);
  } catch (error) {
    console.error("Update Site Error:", error);
    res.status(500).json({ error: "Failed to update site" });
  }
};

export default withAuth(updateSiteHandler);
