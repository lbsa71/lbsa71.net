import { Config } from "./getSite";

export const localConfig: Config = {
  defaultSite: {
    user_id: "local",
    admin_user_id: "local",
    urls: ["localhost:3000", "localhost:3001"],
    title: "Local Development",
    theme: "default",
    playlists: ["hallas", "mixes"],
    media_folder: "local",
    byline: "Local Development Site",
  },
  sites: [
    {
      user_id: "local",
      admin_user_id: "local",
      urls: ["localhost:3000", "localhost:3001"],
      title: "Local Development",
      theme: "default",
      playlists: ["hallas", "mixes"],
      media_folder: "local",
      byline: "Local Development Site",
    }
  ]
}; 