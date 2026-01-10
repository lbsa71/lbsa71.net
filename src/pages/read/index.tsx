import {
  ContentDocument,
  ReqContext,
  Site,
} from "@/lib/getSite";

import { listDocuments } from "../api/list";
import { safe } from "@/lib/safe";
import { wrapDocument } from "@/lib/wrapDocument";
import Script from "next/script";
import { fetchSiteByContext } from "@/lib/dynamodb";
import { withBasePath } from "@/lib/paths";

export async function getServerSideProps(context: ReqContext) {
  const site = await fetchSiteByContext(context);
  const { user_id } = site;

  const documents = (await listDocuments(user_id))?.map(wrapDocument);

  if (!documents || documents.length === 0) {
    return {
      redirect: {
        destination: "/404",
        permanent: true,
      },
    };
  }

  if (documents.length === 1) {
    const { document_id } = documents[0];
    return {
      redirect: {
        destination: `/read/${document_id}`,
        permanent: true,
      },
    };
  }

  return { props: { site, documents } };
}

const List = ({
  site,
  documents,
}: {
  site: Site;
  documents: ContentDocument[];
}) => {
  const playlists = [...site.playlists, "Miscellaneous"];

  const documentGroups: Record<string, ContentDocument[]>[] = playlists.map(
    (playlist) => ({ [playlist]: [] })
  );

  const getPlaylistName = (doc: ContentDocument): string =>
    playlists?.includes(doc.playlist) ? doc.playlist : "Miscellaneous";

  documents.forEach((doc) => {
    const playlistName = getPlaylistName(doc);
    const index = playlists.indexOf(playlistName);
    documentGroups[index][playlistName].push(doc);
  });

  documentGroups.forEach((group) => {
    const playlistName = Object.keys(group)[0];
    group[playlistName].sort((a, b) =>
      safe(a.ordinal).localeCompare(safe(b.ordinal), undefined, {
        numeric: true,
      })
    );
  });

  const showFeed = !!site.feed;

  return (
    <>
      {site.feed && (
        <Script type="module" src="https://esm.sh/emfed@1"></Script>
      )}
      {site.banner && (
        <img src={site.banner} alt={site.title} className="banner" />
      )}
      <div className="plaque">
        <h1 className="playlist-column">{site.title}</h1>

        <div className="playlists-container">
          {showFeed && (
            <div key="feed" className="playlist-column">
              <a className="mastodon-feed" href={site.feed} data-toot-limit="2">
                follow me into the Fediverse
              </a>
            </div>
          )}
          {documentGroups.map((group) => {
            const playlist = Object.keys(group)[0];
            const docs = group[playlist];

            if (docs.length === 0) return null;

            return (
              <div key={playlist} className="playlist-column">
                <h2>{playlist}</h2>
                <ul>
                  {docs.map((doc) => {
                    const title = doc.title ?? doc.document_id;
                    return (
                      <li key={doc.document_id}>
                        <a href={withBasePath(`/read/${doc.document_id}`)}>{title}</a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default List;
