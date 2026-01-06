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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);

  if (typeof user_id !== "string" || !site || !user || user.sub !== site.admin_user_id) {
    return <div>Unauthorized</div>;
  }

  const handleDelete = async (documentId: string) => {
    try {
      await operations.deleteDocument(user_id, documentId);
      // Refresh the documents list
      const updatedDocs = await operations.listDocuments(user_id);
      setDocuments(updatedDocs);
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Documents for {user_id}</h1>
      <ul className="space-y-2">
        {documents &&
          documents.map((doc) => {
            const title = doc.title ?? doc.document_id;
            return (
              <li key={doc.document_id} className="flex items-center gap-2">
                <a
                  href={`/edit/${doc.user_id}/${doc.document_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {title}
                </a>
                <button
                  onClick={() => handleDelete(doc.document_id)}
                  className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default EditList;
