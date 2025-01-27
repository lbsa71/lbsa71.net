import MarkdownEditor from "@/components/MarkdownEditor";
import { Config, ContentDocument, ReqContext } from "@/lib/getSite";
import { createAuthenticatedOperations } from "@/lib/http";
import { useAuth } from "@/context/AuthContext";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  const { token } = useAuth();
  const operations = createAuthenticatedOperations(token);

  const [document, setDocument] = useState<ContentDocument>(defaultDocument);

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
      fetchDocument(user_id, document_id);
    }
  }, [user_id, document_id]);

  return <MarkdownEditor _config={_config} document={document} setDocument={setDocument} />;
};

export default EditorPage;
