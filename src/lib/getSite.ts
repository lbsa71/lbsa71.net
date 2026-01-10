export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Config = {
  defaultSite: SiteConfig;
  sites: SiteConfig[];
};

export type Redirect = {
  destination: string;
  permanent: boolean;
};

export type Site = {
  title: string;
  user_id: string;
  admin_user_id: string;
  urls: string[];
  aliases?: string[];
  playlists: string[];
  feed?: string;
  theme: string;
  media_folder: string;
  media_url: string;
  byline: string;
  banner?: string;
  redirect?: Redirect;
  info?: string;
};

type SiteConfig = Partial<Omit<Site, 'user_id' | 'urls' | 'admin_user_id'>> & {
  user_id: string;
  urls: string[];
  admin_user_id: string;
};

const wrap = (site: SiteConfig): Site => {
  const media_folder = site.media_folder ?? site.user_id;
  const media_url = `https://media.lbsa71.net/${media_folder}`;
  const title = site.title ?? site.user_id;
  const byline = site.byline ?? "";

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
  info?: string;
};

export type RequestHeaders = {
  host?: string;
  'x-forwarded-host'?: string;
};

export type ReqContext = {
  req: {
    headers: RequestHeaders;
  };
};

export function findSiteByContext(config: Config, context: ReqContext): Site {
  const { req } = context;
  const host = req.headers.host;
  const forwardedHost = req.headers['x-forwarded-host'];

  const domain = forwardedHost || host;
  
  if (!domain) {
    throw new Error('No domain found in request headers');
  }

  return findSiteByDomain(config, domain);
}

export function findSiteByDomain(config: Config, domain: string): Site {
  // First, try to find site by direct URL match
  let site = config.sites.find((site) => site.urls.includes(domain));

  // If not found, try to find site by alias
  if (!site) {
    site = config.sites.find((site) => site.aliases?.includes(domain));
  }

  if (!site) {
    throw new Error(`Site configuration not found for domain: ${domain}`);
  }

  return wrap(site);
}

export function findSiteByUserId(config: Config, user_id: string): Site {
  const site = config.sites.find((site) => site.user_id === user_id);

  if (!site) {
    throw new Error(`Site configuration not found for user: ${user_id}`);
  }

  return wrap(site);
}
