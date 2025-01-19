export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Config = {
  defaultSite: SiteConfig;
  sites: SiteConfig[];
};

export type Site = {
  title: string;
  user_id: string;
  admin_user_id: string;
  urls: string[];
  playlists: string[];
  feed?: string;
  theme: string;
  media_folder: string;
  media_url: string;
  byline: string;
  banner?: string;
  redirect?: {
    destination: string;
    permanent: boolean;
  };
};

type SiteConfig = Partial<Site> & {
  user_id: string;
  urls: string[];
  admin_user_id: string;
};

const wrap = (
  site: SiteConfig
): Site => {

  const media_folder = site.media_folder ?? site.user_id;
  const media_url = `https://media.lbsa71.net/${media_folder}`;
  const title = site.title ?? site.user_id;
  const byline = "";

  return {
    theme: "default",
    playlists: [],
    ...site,
    media_folder,
    media_url,
    title,
    byline,
  };
};

export type ContentDocument = {
  content: string;
  document_id: string;
  hero_img: string;
  media_item: string;
  ordinal: string;
  playlist: string;
  title: string;
  user_id: string;
};

export type ReqContext = {
  req: any;
};

export function findSiteByContext(config: Config, context: ReqContext) {
  const { req } = context;
  const host = req.headers.host; // Direct host access
  const forwardedHost = req.headers["x-forwarded-host"]; // If behind a proxy

  const domain = forwardedHost || host;

  return findSiteByDomain(config, domain);
}

export function findSiteByDomain(config: Config, domain: string) {
  const site = config.sites.find((site) => site.urls.includes(domain));

  if (!site) {
    throw new Error(`Site ${domain}` + " config not found");
  }

  return wrap(site);
}

export function findSiteByUserId(config: Config, user_id: string) {
  const site = config.sites.find((site) => site.user_id === user_id);

  if (!site) {
    throw new Error(`User ${user_id}` + " config not found");
  }

  return wrap(site);
}
