import MarkdownEditor from "@/components/MarkdownEditor";
import { Config, ContentDocument, ReqContext } from "@/lib/getSite";
import { createAuthenticatedOperations } from "@/lib/http";
import { useAuth } from "@/context/AuthContext";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export const defaultDocument: ContentDocument = {
  hero_img: "",
  media_item: "",
  user_id: "",
  title: "",
  content: "",
  document_id: "",
  playlist: "",
  ordinal: "",
};

const EditorPage = ({ _config }: { _config: Config }) => {
  const router = useRouter();
  const { user_id, document_id } = router.query;
  const { token, user } = useAuth();
  const operations = createAuthenticatedOperations(token);

  const [document, setDocument] = useState<ContentDocument>(defaultDocument);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  const checkPermission = async (userId: string) => {
    if (!token || !user) {
      setHasPermission(false);
      setIsCheckingPermission(false);
      return;
    }

    try {
      const { data } = await axios.get<{ hasPermission: boolean }>("/api/checkPermission", {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: userId },
      });
      setHasPermission(data.hasPermission);
    } catch (error) {
      console.error("Failed to check permission", error);
      setHasPermission(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const fetchDocument = async (userId: string, documentId: string) => {
    try {
      const document = await operations.readDocument(userId, documentId);
      setDocument(document);
    } catch (error) {
      setDocument({
        ...defaultDocument,
        user_id: userId,
        document_id: documentId,
      });
      console.error("Failed to fetch document", error);
    }
  };

  useEffect(() => {
    if (
      user_id &&
      document_id &&
      typeof user_id === "string" &&
      typeof document_id === "string"
    ) {
      checkPermission(user_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id, document_id, token, user]);

  useEffect(() => {
    if (
      hasPermission === true &&
      user_id &&
      document_id &&
      typeof user_id === "string" &&
      typeof document_id === "string"
    ) {
      fetchDocument(user_id, document_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission, user_id, document_id]);

  if (isCheckingPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">
            You do not have permission to edit this document.
          </p>
        </div>
      </div>
    );
  }

  return <MarkdownEditor _config={_config} document={document} setDocument={setDocument} />;
};

export default EditorPage;
