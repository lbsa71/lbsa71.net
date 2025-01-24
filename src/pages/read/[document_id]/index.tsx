import React from "react";
import { ContentDocument, Site } from "@/types/core";
import { GetServerSidePropsContext } from "next";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { listDocuments } from "@/pages/api/list";
import { wrapDocument } from "@/lib/wrapDocument";
import { fetchSiteByContext } from "@/lib/dynamodb";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const site = await fetchSiteByContext(context);

  const { user_id } = site;
  const document_id = context.params?.document_id;

  if (typeof user_id !== "string" || typeof document_id !== "string") {
    throw new Error("Invalid query");
  }

  const documents = (await listDocuments(user_id))?.map(wrapDocument) ?? [];

  const document = documents.find((doc) => doc.document_id === document_id);

  return { props: { site, document, documents } };
};

const Read = ({
  site,
  document,
  documents,
}: {
  site: Site;
  document: string;
  documents: ContentDocument[];
}) => {
  return (
    <DocumentRenderer site={site} document={document} documents={documents} />
  );
};

export default Read;
