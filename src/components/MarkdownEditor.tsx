import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { MarkdownSyntaxHelp } from "./MarkdownSyntaxHelp";
import { Config, ContentDocument, findSiteByUserId, Site } from "@/lib/getSite";
import { DocumentRenderer } from "./DocumentRenderer";
import { defaultDocument } from "@/pages/edit/[user_id]/[document_id]";

type MarkdownEditorProps = {
  _config: Config;
  document: ContentDocument;
  setDocument: Dispatch<SetStateAction<ContentDocument>>;
};

type MarkdownRendererProps = {
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  document: ContentDocument;
  site: Site;
  setDocument: Dispatch<SetStateAction<ContentDocument>>;
};

const MarkdownRenderer = ({
  handleSave,
  handleDelete,
  document,
  site,
  setDocument,
}: MarkdownRendererProps) => {
  const isEditMode = document.userId && document.id;

  const handleInputChange = (field: keyof ContentDocument) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDocument(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

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
            value={document.userId}
            onChange={handleInputChange("userId")}
            style={{
              marginRight: "10px",
              padding: "10px",
              width: "calc(50% - 5px)",
            }}
          />
          <input
            type="text"
            placeholder="Document ID (leave blank to create)"
            value={document.id}
            onChange={handleInputChange("id")}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Hero image URL"
            value={document.heroImage}
            onChange={handleInputChange("heroImage")}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Media Item URL"
            value={document.mediaItem}
            onChange={handleInputChange("mediaItem")}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Playlist"
            value={document.playlist}
            onChange={handleInputChange("playlist")}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
          <input
            type="text"
            placeholder="Ordinal"
            value={document.ordinal}
            onChange={handleInputChange("ordinal")}
            style={{ padding: "10px", width: "calc(50% - 5px)" }}
          />
        </div>

        <textarea
          placeholder="Enter markdown"
          value={document.content}
          onChange={handleInputChange("content")}
          style={{ flex: 1, padding: "10px", minHeight: "300px" }}
        />
        <MarkdownSyntaxHelp />

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

export const MarkdownEditor = ({
  document,
  setDocument,
  _config
}: MarkdownEditorProps) => {
  const { userId, id } = document;

  if (!userId) return null;

  const site = findSiteByUserId(_config, userId);
  const isEditMode = userId && id;

  const handleSave = async () => {
    const endpoint = isEditMode ? "/api/update" : "/api/create";

    try {
      const { data } = await axios.post<Partial<ContentDocument>>(endpoint, document);
      setDocument(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Failed to save document", error);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    try {
      await axios.delete("/api/delete", {
        data: { userId, id },
      });
      setDocument(defaultDocument);
      alert("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <MarkdownRenderer
      handleSave={handleSave}
      handleDelete={handleDelete}
      document={document}
      site={site}
      setDocument={setDocument}
    />
  );
};

export default MarkdownEditor;
