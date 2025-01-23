// pages/_app.tsx
import React, { useState } from "react";
import { AppProps } from "next/app";
import type { NextPage, NextPageContext } from 'next/types';
import GlobalLayout from "../components/GlobalLayout";
import { Config, findSiteByDomain, Site } from "../lib/getSite";
import { AudioProvider } from "../context/AudioContext";
import { AuthProvider } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import "../styles/globals.css";

export type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
};

type AppPropsWithSite = AppProps & {
  pageProps: {
    site: Site;
    config: Config;
    [key: string]: unknown;
  };
};

type GetInitialPropsResult = {
  pageProps: {
    site: Site;
    _config: Config;
    [key: string]: unknown;
  };
};

type NextPageWithGetInitialProps = NextPage & {
  getInitialProps?: (ctx: NextPageContext) => Promise<{ pageProps: Record<string, unknown> }>;
};

type GetInitialPropsContext = {
  Component: NextPageWithGetInitialProps;
  ctx: NextPageContext & {
    req?: {
      headers: {
        host?: string;
      };
    };
  };
};

const MyApp = ({ Component, pageProps }: AppPropsWithSite) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <AudioProvider>
        <GlobalLayout site={pageProps.site}>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <button onClick={() => setMenuOpen((prev) => !prev)}>
              Menu
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                <AuthMenu />
              </div>
            )}
          </div>
          <Component {...pageProps} />
        </GlobalLayout>
      </AudioProvider>
    </AuthProvider>
  );
};

MyApp.getInitialProps = async (appContext: GetInitialPropsContext): Promise<GetInitialPropsResult> => {
  const result = (await appContext.Component.getInitialProps?.(appContext.ctx)) as { pageProps: Record<string, unknown> };
  const pageProps = result?.pageProps ?? {};

  let site: Site;
  let _config: Config;

  if (appContext?.ctx?.req?.headers?.host) {
    const { getConfig } = await import("./api/lib/dynamodbClient");
    _config = await getConfig();

    const host = appContext.ctx.req.headers.host;
    site = await findSiteByDomain(_config, host);
  } else {
    console.log("--- No host header - cannot determine site");
    throw new Error("No host header - cannot determine site");
  }

  return {
    pageProps: {
      ...pageProps,
      _config,
      site,
    },
  };
};

type AuthMenuProps = {
  className?: string;
};

const AuthMenu = ({ className }: AuthMenuProps) => {
  const { user, login, logout } = useAuth();

  return (
    <div className={className}>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={credentialResponse => {
            if (credentialResponse.credential) {
              const decoded = jwtDecode<User>(credentialResponse.credential);
              login(decoded);
            } else {
              console.log('Credential is undefined');
            }
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      )}
    </div>
  );
};

export default MyApp;

