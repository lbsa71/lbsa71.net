import Head from "next/head";
import React, { useEffect } from "react";
import { Site } from "@/lib/getSite";

const addCss = (theme: string) => {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = `/css/${theme}.css`;

  document.head.appendChild(link);
  return link;
};

const GlobalLayout = ({
  children,
  site,
}: { children: React.ReactNode } & { site: Site }) => {
  const title = site?.title;
  const byline = site?.byline;
  const theme = site?.theme;

  useEffect(() => {
    const themeCss = addCss(theme);

    return () => {
      if (document.head.lastChild) {
        document.head.removeChild(themeCss);
      }
    };
  }, [theme]);

  return (
    <>
      <Head>
        <title>{title}</title>
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
