import { ContentDocument } from "@/types/core";

function removeUndefined<T extends Record<string, any>>(obj: T): T {
  const entries = Object.entries(obj).filter(([_, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
}

const now = new Date().toISOString();

export const localDocument = removeUndefined<ContentDocument>({
  document_id: "local1",
  user_id: "local",
  content: "# HALLAS1",
  title: "HALLAS1",
  mediaItem: "http://localhost:3000/demo/CantinaBand3.wav",
  playlist: "hallas",
  heroImage: "hallas-1024x744.png",
  ordinal: "1",
  nodes: [],
  createdAt: now,
  updatedAt: now,
});

const localDocument2 = removeUndefined<ContentDocument>({
  document_id: "local2",
  user_id: "local",
  content: "# HALLAS2",
  title: "HALLAS2",
  mediaItem: "http://localhost:3000/demo/ovre-bygden-den-som-lovar-listening.mp4",
  playlist: "hallas",
  heroImage: "",
  ordinal: "2",
  nodes: [],
  createdAt: now,
  updatedAt: now,
});

const localDocument3 = removeUndefined<ContentDocument>({
  document_id: "local3",
  user_id: "local",
  content: "# HALLAS3",
  title: "HALLAS3",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "hallas",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
});

const localDocument4 = removeUndefined<ContentDocument>({
  document_id: "local4",
  user_id: "local",
  content: "# Mixes1",
  title: "Mixes1",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "mixes",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
});

const localDocument5 = removeUndefined<ContentDocument>({
  document_id: "local5",
  user_id: "local",
  content: "# Mixes2",
  title: "Mixes2",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "mixes",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
});

export const localDocuments = [
  localDocument,
  localDocument2,
  localDocument3,
  localDocument4,
  localDocument5,
];
