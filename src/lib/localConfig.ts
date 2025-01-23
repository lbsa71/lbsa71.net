import { Config } from "./getSite";

export const localConfig: Config = {
  defaultSite: {
    userId: "local",
    adminUserId: "local",
    urls: ["localhost:3000", "localhost:3001"],
    title: "Local Development",
    theme: "default",
    playlists: ["hallas", "mixes"],
    mediaFolder: "local",
    byline: "Local Development Site",
  },
  sites: [
    {
      userId: "local",
      adminUserId: "local",
      urls: ["localhost:3000", "localhost:3001"],
      title: "Local Development",
      theme: "default",
      playlists: ["hallas", "mixes"],
      mediaFolder: "local",
      byline: "Local Development Site",
    }
  ]
}; 