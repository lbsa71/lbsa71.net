import MarkdownEditor from "@/components/MarkdownEditor";
import { Config } from "@/lib/getSite";
import { ContentDocument } from "@/types/core";
import axios from "axios";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const defaultDocument: ContentDocument = {
  document_id: "",
  user_id: "",
  title: "",
  content: "",
  heroImage: "",
  mediaItem: "",
  playlist: "",
  ordinal: "",
  nodes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type APIContentDocument = {
  data: ContentDocument;
};

const fetchDocument = (
  user_id: string,
  documentId: string,
  setDocument: React.Dispatch<React.SetStateAction<ContentDocument>>
) => {
  axios
    .get<any, APIContentDocument>(
      `/api/read?user_id=${user_id}&document_id=${documentId}`
    )
    .then((response) => {
      const document = response.data;
      setDocument(document);
    })
    .catch((error) => {
      setDocument({
        ...defaultDocument,
        user_id,
        document_id: documentId,
      });
      return console.error("Failed to fetch document", error);
    });
};

const EditorPage = ({ _config }: { _config: Config }) => {
  const router = useRouter();
  const { user_id, document_id } = router.query;

  const [document, setDocument] = useState<ContentDocument>(defaultDocument);

  useEffect(() => {
    if (
      user_id &&
      document_id &&
      typeof user_id === "string" &&
      typeof document_id === "string"
    ) {
      fetchDocument(user_id, document_id, setDocument);
    }
  }, [user_id, document_id]);

  return <MarkdownEditor _config={_config} document={document} setDocument={setDocument} />;
};

export default EditorPage;
