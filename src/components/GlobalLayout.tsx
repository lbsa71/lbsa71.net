import Head from "next/head";
import { useEffect, ReactNode, useState } from "react";
import { Site } from "@/lib/getSite";
import { withBasePath } from "@/lib/paths";
import { InfoModal } from "./InfoModal";

type GlobalLayoutProps = {
  children: ReactNode;
  site: Site;
};

const addCss = (theme: string): HTMLLinkElement => {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = withBasePath(`/css/${theme}.css`);

  document.head.appendChild(link);
  return link;
};

const GlobalLayout = ({ children, site }: GlobalLayoutProps) => {
  const { title, byline, theme } = site;
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
        {site.info && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                color: '#333',
              }}
            >
              Info
            </button>
          </div>
        )}
        <main>{children}</main>
        {/* <footer>{byline}</footer> */}
      </div>
      {site.info && (
        <InfoModal
          info={site.info}
          media_url={site.media_url}
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
        />
      )}
    </>
  );
};

export default GlobalLayout;
