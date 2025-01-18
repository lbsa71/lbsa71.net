import React, { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { MarkdownSyntaxHelp } from "./MarkdownSyntaxHelp";
import { ContentDocument, Site } from "@/lib/getSite";
import { DocumentRenderer } from "./DocumentRenderer";
import { defaultDocument } from "@/pages/edit/[user_id]/[document_id]";
import { fetchSiteByUserId } from "@/pages/api/lib/dynamodbClient";

type MarkdownEditorProps = {
  document: ContentDocument;
  setDocument: Dispatch<SetStateAction<ContentDocument>>;
};

const MarkdownRenderer = (
  handleSave: () => Promise<void>,
  handleDelete: () => Promise<void>,
  site: Site,
  document: ContentDocument,
  setDocument: React.Dispatch<React.SetStateAction<ContentDocument>>
) => {
  const isEditMode = document.user_id && document.document_id;

  return (
    <div
      style={{ display: "flex", height: "calc(100vh - 40px)", margin: "20px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginRight: "20px",
          flex: 1,
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="User ID"
            value={document.user_id}
            onChange={(e) =>
              setDocument({
                ...document,
                user_id: e.target.value,
              })
            }
            style={{
              marginRight: "10px",
              padding: "10px",
              width: "calc(50% - 5px)",
            }}
          />
          <input
            type="text"
            placeholder="Document ID (leave blank to create)"
            value={document.document_id}
            onChange={(e) =>
              setDocument({
                ...document,
                document_id: e.target.value,
              })
            }
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Hero image URL"
            value={document.hero_img}
            onChange={(e) => {
              setDocument({
                ...document,
                hero_img: e.target.value,
              });
            }}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Media Item URL"
            value={document.media_item}
            onChange={(e) => {
              setDocument({
                ...document,
                media_item: e.target.value,
              });
            }}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Playlist"
            value={document.playlist}
            onChange={(e) => {
              setDocument({
                ...document,
                playlist: e.target.value,
              });
            }}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Ordinal"
            value={document.ordinal}
            onChange={(e) => {
              setDocument({
                ...document,
                ordinal: e.target.value,
              });
            }}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
        </div>

        {/* Textarea and MarkdownSyntaxHelp */}
        <textarea
          placeholder="Enter markdown"
          value={document.content}
          onChange={(e) =>
            setDocument({
              ...document,
              content: e.target.value,
            })
          }
          style={{ flex: 1, padding: "10px", minHeight: "300px" }} // Adjust the height as needed
        />
        <MarkdownSyntaxHelp />

        {/* Save and Delete buttons */}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleSave}
            style={{ padding: "10px 15px", marginRight: "10px" }}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            disabled={!isEditMode}
            style={{ padding: "10px 15px" }}
          >
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "10px",
          border: "2px solid #007bff",
          borderRadius: "5px",
          overflowY: "auto",
          backgroundColor: "#f6f8fa",
        }}
      >
        <DocumentRenderer site={site} document={document} documents={[]} />
      </div>
    </div>
  );
};

export const MarkdownEditor = async ({
  document,
  setDocument,
}: MarkdownEditorProps) => {
  const { user_id, document_id } = document;

  const site = await fetchSiteByUserId(user_id);

  const isEditMode = user_id && document_id;

  const handleSave = async () => {
    const endpoint = isEditMode ? "/api/update" : "/api/create";
    const payload = document;

    try {
      const result = await axios.post(endpoint, payload);

      const data = result.data;

      const refetchedDocument = { ...document, ...data };
      setDocument(refetchedDocument);
    } catch (error) {
      console.error("Failed to save document", error);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    try {
      await axios.delete("/api/delete", {
        data: { user_id, document_id },
      });
      setDocument(defaultDocument);
      alert("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return MarkdownRenderer(
    handleSave,
    handleDelete,
    site,
    document,
    setDocument
  );
};

export default MarkdownEditor;
