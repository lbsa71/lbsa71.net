import { Config, ContentDocument, findSiteByUserId, Site } from "@/lib/getSite";
import { useAuth } from "@/context/AuthContext";
import { fetchSiteByContext, fetchSiteByUserId } from "@/lib/dynamodb";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

type APIContentDocuments = {
  data: ContentDocument[];
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { user_id } = context.params || {};

  const site = await fetchSiteByUserId(user_id as string);

  return { props: { site } };
};

const EditList = ({ site }: { site: Site }) => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<ContentDocument[]>();
  const userId = site.userId;

  useEffect(() => {
    if (!userId) return;

    axios
      .get<any, APIContentDocuments>(`/api/list?user_id=${userId}`)
      .then((response) => {
        const documents = response.data;
        setDocuments(documents);
      })
      .catch((error) => console.error("Failed to fetch document", error));
  }, [userId]);

  console.log("site", JSON.stringify(site, null, 2));
  console.log("user", JSON.stringify(user, null, 2));

  if (typeof userId !== "string" || !site || !user || user.sub !== site.adminUserId) {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <h1>Documents for {userId}</h1>
      <ul>
        {documents &&
          documents.map((doc) => {
            const title = doc.title ?? doc.id;
            return (
              <li key={doc.id}>
                <a href={`/edit/${doc.userId}/${doc.id}`}>{title}</a>
                &nbsp;
                <a
                  href={`/api/delete?user_id=${doc.userId}/${doc.id}`}
                >
                  Delete
                </a>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default EditList;
