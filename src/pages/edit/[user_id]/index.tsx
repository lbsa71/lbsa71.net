import { Config, ContentDocument, findSiteByUserId, Site } from "@/lib/getSite";
import { useAuth } from "@/context/AuthContext";
import { fetchSiteByContext, fetchSiteByUserId } from "@/lib/dynamodb";
import { createAuthenticatedOperations } from "@/lib/http";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/paths";
import { MarkdownSyntaxHelp } from "@/components/MarkdownSyntaxHelp";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {

  const { user_id } = context.params || {};

  const site = await fetchSiteByUserId(user_id as string);

  return { props: { site } };
};

const EditList = ({ site: initialSite }: { site: Site }) => {
  const { user, token } = useAuth();
  const operations = createAuthenticatedOperations(token);

  const [documents, setDocuments] = useState<ContentDocument[]>();
  const [site, setSite] = useState<Site>(initialSite);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoContent, setInfoContent] = useState(site.info || "");
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

  const handleSaveInfo = async () => {
    try {
      const updatedSite = await operations.updateSiteInfo(user_id, infoContent);
      setSite(updatedSite);
      setIsEditingInfo(false);
      alert("Site info updated successfully");
    } catch (error) {
      console.error("Failed to update site info", error);
      alert("Failed to update site info");
    }
  };

  const handleCancelEdit = () => {
    setInfoContent(site.info || "");
    setIsEditingInfo(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Documents for {user_id}</h1>
      
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Site Info</h2>
          {!isEditingInfo && (
            <button
              onClick={() => setIsEditingInfo(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {site.info ? "Edit Info" : "Add Info"}
            </button>
          )}
        </div>
        
        {isEditingInfo ? (
          <div>
            <textarea
              value={infoContent}
              onChange={(e) => setInfoContent(e.target.value)}
              placeholder="Enter markdown content for the info modal..."
              className="w-full p-3 border rounded mb-2 font-mono text-sm"
              style={{ minHeight: "200px" }}
            />
            <MarkdownSyntaxHelp />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleSaveInfo}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">
            {site.info ? (
              <p className="whitespace-pre-wrap">{site.info.substring(0, 100)}{site.info.length > 100 ? "..." : ""}</p>
            ) : (
              <p className="italic">No info content set. Click &quot;Add Info&quot; to add content that will appear in the info modal.</p>
            )}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Documents</h2>
      <ul className="space-y-2">
        {documents &&
          documents.map((doc) => {
            const title = doc.title ?? doc.document_id;
            return (
              <li key={doc.document_id} className="flex items-center gap-2">
                <a
                  href={withBasePath(`/edit/${doc.user_id}/${doc.document_id}`)}
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
