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
  userId: string;
  adminUserId: string;
  urls: string[];
  playlists: string[];
  feed?: string;
  theme: string;
  mediaFolder: string;
  mediaUrl: string;
  byline: string;
  banner?: string;
  redirect?: Redirect;
};

type SiteConfig = Partial<Omit<Site, 'userId' | 'urls' | 'adminUserId'>> & {
  userId: string;
  urls: string[];
  adminUserId: string;
};

const wrap = (site: SiteConfig): Site => {
  const mediaFolder = site.mediaFolder ?? site.userId;
  const mediaUrl = `https://media.lbsa71.net/${mediaFolder}`;
  const title = site.title ?? site.userId;
  const byline = site.byline ?? "";

  return {
    theme: "default",
    playlists: [],
    ...site,
    mediaFolder,
    mediaUrl,
    title,
    byline,
  };
};

export type { ContentDocument } from '@/types/core';

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
  const site = config.sites.find((site) => site.urls.includes(domain));

  if (!site) {
    throw new Error(`Site configuration not found for domain: ${domain}`);
  }

  return wrap(site);
}

export function findSiteByUserId(config: Config, userId: string): Site {
  const site = config.sites.find((site) => site.userId === userId);

  if (!site) {
    throw new Error(`Site configuration not found for user: ${userId}`);
  }

  return wrap(site);
}
