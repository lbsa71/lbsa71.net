import MarkdownEditor from "@/components/MarkdownEditor";
import { ContentDocument } from "@/lib/getSite";
import axios from "axios";
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

type APIContentDocument = {
  data: ContentDocument;
};

const fetchDocument = (
  userId: string,
  documentId: string,
  setDocument: React.Dispatch<React.SetStateAction<ContentDocument>>
) => {
  axios
    .get<any, APIContentDocument>(
      `/api/read?user_id=${userId}&document_id=${documentId}`
    )
    .then((response) => {
      const document = response.data;

      console.error("Fetched document", document);

      setDocument(document);
    })
    .catch((error) => {
      setDocument({
        ...defaultDocument,
        user_id: userId,
        document_id: documentId,
      });
      return console.error("Failed to fetch document", error);
    });
};

const EditorPage = () => {
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

  return <MarkdownEditor document={document} setDocument={setDocument} />;
};

export default EditorPage;
