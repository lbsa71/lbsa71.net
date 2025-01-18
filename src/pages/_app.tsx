// pages/_app.tsx
import React from "react";
import App, { AppContext } from "next/app";
import GlobalLayout from "../components/GlobalLayout";
import { Site } from "../lib/getSite";
import { AudioProvider } from "../context/AudioContext";
import "../styles/globals.css";

class MyApp extends App {
  static async getInitialProps(appContext: AppContext) {
    const appProps = await App.getInitialProps(appContext);
    let site: Site;

    if (appContext?.ctx?.req?.headers?.host) {
      const host = appContext.ctx.req.headers.host;
      const { fetchSiteByDomain } = await import("./api/lib/dynamodbClient");
      site = await fetchSiteByDomain(host);
    } else {
      throw new Error("No host header - cannot determine site");
    }

    return { ...appProps, site };
  }

  render() {
    const { Component, pageProps, site } = this.props;

    return (
      <AudioProvider>
        <GlobalLayout site={site}>
          <Component {...pageProps} />
        </GlobalLayout>
      </AudioProvider>
    );
  }
}

export default MyApp;
