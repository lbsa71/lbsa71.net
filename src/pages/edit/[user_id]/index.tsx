import { ContentDocument } from "@/lib/getSite";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type APIContentDocuments = {
  data: ContentDocument[];
};

const EditList = () => {
  const router = useRouter();

  const [documents, setDocuments] = useState<ContentDocument[]>();

  const { user_id } = router.query;

  useEffect(() => {
    if (!user_id) return;

    axios
      .get<any, APIContentDocuments>(`/api/list?user_id=${user_id}`)
      .then((response) => {
        const documents = response.data;
        setDocuments(documents);
      })
      .catch((error) => console.error("Failed to fetch document", error));
  }, [user_id]);

  if (typeof user_id !== "string") {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
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
