import Head from "next/head";
import { useEffect, ReactNode } from "react";
import { Site } from "@/lib/getSite";

type GlobalLayoutProps = {
  children: ReactNode;
  site: Site;
};

const addCss = (theme: string): HTMLLinkElement => {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = `/css/${theme}.css`;

  document.head.appendChild(link);
  return link;
};

const GlobalLayout = ({ children, site }: GlobalLayoutProps) => {
  const { title, byline, theme } = site;

  useEffect(() => {
    const themeCss = addCss(theme);
    return () => themeCss.remove();
  }, [theme]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={byline} />
      </Head>
      <div style={{ margin: "0 auto", padding: "20px" }}>
        {/* <header>{title}</header> */}
        <main>{children}</main>
        {/* <footer>{byline}</footer> */}
      </div>
    </>
  );
};

export default GlobalLayout;
