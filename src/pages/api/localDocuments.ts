import { ContentDocument } from "@/types/core";

const now = new Date().toISOString();

export const localDocument: ContentDocument = {
  id: "local1",
  userId: "local",
  content: "# HALLAS1",
  title: "HALLAS1",
  mediaItem: "http://localhost:3000/demo/CantinaBand3.wav",
  playlist: "hallas",
  heroImage: "hallas-1024x744.png",
  ordinal: "1",
  nodes: [],
  createdAt: now,
  updatedAt: now,
};

const localDocument2: ContentDocument = {
  id: "local2",
  userId: "local",
  content: "# HALLAS2",
  title: "HALLAS2",
  mediaItem: "http://localhost:3000/demo/ovre-bygden-den-som-lovar-listening.mp4",
  playlist: "hallas",
  heroImage: "",
  ordinal: "2",
  nodes: [],
  createdAt: now,
  updatedAt: now,
};

const localDocument3: ContentDocument = {
  id: "local3",
  userId: "local",
  content: "# HALLAS3",
  title: "HALLAS3",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "hallas",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
};

const localDocument4: ContentDocument = {
  id: "local4",
  userId: "local",
  content: "# Mixes1",
  title: "Mixes1",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "mixes",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
};

const localDocument5: ContentDocument = {
  id: "local5",
  userId: "local",
  content: "# Mixes2",
  title: "Mixes2",
  mediaItem: "http://localhost:3000/demo/StarWars3.wav",
  playlist: "mixes",
  heroImage: "http:/demo/frans.png",
  ordinal: "4",
  nodes: [],
  createdAt: now,
  updatedAt: now,
};

export const localDocuments = [
  localDocument,
  localDocument2,
  localDocument3,
  localDocument4,
  localDocument5,
];
