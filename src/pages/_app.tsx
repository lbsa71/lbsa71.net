// pages/_app.tsx
import React, { useState } from "react";
import { AppProps } from "next/app";
import GlobalLayout from "../components/GlobalLayout";
import { Site } from "../lib/getSite";
import { AudioProvider } from "../context/AudioContext";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import "../styles/globals.css";

type User = {
  email: string;
  sub: string;
};

function MyApp({ Component, pageProps }: AppProps & { site: Site }) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  console.log("pageProps", JSON.stringify(pageProps, null, 2));

  return (
    <GoogleOAuthProvider clientId="1056104670088-ci05aih7o27hp9aj22ppipmh6n7a2174.apps.googleusercontent.com">
      <AudioProvider>
        <GlobalLayout site={pageProps.site}>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              Menu
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                {user ? (
                  <div>
                    <p>Welcome, {user.email}</p>
                    <p>User ID: {user.sub}</p>
                    <button onClick={() => {
                      googleLogout();
                      setUser(null);
                    }}>Logout</button>
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      if (credentialResponse.credential) {
                        const decoded = jwtDecode<User>(credentialResponse.credential);
                        setUser(decoded);
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
            )}
          </div>
          <Component {...pageProps} />
        </GlobalLayout>
      </AudioProvider>
    </GoogleOAuthProvider>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = appContext.Component.getInitialProps
    ? await appContext.Component.getInitialProps(appContext.ctx)
    : {};
  let site: Site;

  console.log("--- resolving site");

  if (appContext?.ctx?.req?.headers?.host) {
    const host = appContext.ctx.req.headers.host;
    console.log("Host", host);

    const { fetchSiteByDomain } = await import("./api/lib/dynamodbClient");
    site = await fetchSiteByDomain(host);
    console.log("Site", JSON.stringify(site, null, 2));
  } else {
    console.log("--- No host header - cannot determine site");

    throw new Error("No host header - cannot determine site");
  }

  return { ...appProps, site, pageProps: appProps.pageProps || {} };
};

export default MyApp;
