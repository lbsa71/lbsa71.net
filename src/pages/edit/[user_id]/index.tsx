import { Config, ContentDocument, findSiteByUserId, Site } from "@/lib/getSite";
import { useAuth } from "@/context/AuthContext";
import { fetchSiteByContext, fetchSiteByUserId } from "@/lib/dynamodb";
import { createAuthenticatedOperations } from "@/lib/http";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {

  const { user_id } = context.params || {};

  const site = await fetchSiteByUserId(user_id as string);

  return { props: { site } };
};

const EditList = ({ site }: { site: Site }) => {
  const { user, token } = useAuth();
  const operations = createAuthenticatedOperations(token);

  const [documents, setDocuments] = useState<ContentDocument[]>();
  const user_id = site.user_id;

  useEffect(() => {
    if (!user_id) return;

    operations
      .listDocuments(user_id)
      .then(setDocuments)
      .catch((error) => console.error("Failed to fetch document", error));
  }, [user_id]);

  console.log("site", JSON.stringify(site, null, 2));
  console.log("user", JSON.stringify(user, null, 2));

  if (typeof user_id !== "string" || !site || !user || user.sub !== site.admin_user_id) {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <h1>Documents for {user_id}</h1>
      <ul>
        {documents &&
          documents.map((doc) => {
            const title = doc.title ?? doc.document_id;
            return (
              <li key={doc.document_id}>
                <a href={`/edit/${doc.user_id}/${doc.document_id}`}>{title}</a>
                &nbsp;
                <a
                  href={`/api/delete?user_id=${doc.user_id}/${doc.document_id}`}
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
