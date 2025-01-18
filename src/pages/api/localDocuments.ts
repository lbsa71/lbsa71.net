import { ContentDocument } from "@/lib/getSite";
import { wrapDocument } from "../../lib/wrapDocument";

export const localDocument: ContentDocument = wrapDocument({
  content: "# HALLAS1",
  media_item: "http://localhost:3000/demo/CantinaBand3.wav",
  user_id: "local",
  playlist: "hallas",
  hero_img: "hallas-1024x744.png",
  document_id: "local1",
  ordinal: "1",
});

const localDocument2: ContentDocument = wrapDocument({
  content: "# HALLAS2",
  media_item:
    "http://localhost:3000/demo/ovre-bygden-den-som-lovar-listening.mp4",
  user_id: "local",
  playlist: "hallas",
  document_id: "local2",
  hero_img: "",
  ordinal: "2",
});

const localDocument3: ContentDocument = wrapDocument({
  content: "# HALLAS3",
  media_item: "http://localhost:3000/demo/StarWars3.wav",
  user_id: "local",
  playlist: "hallas",
  document_id: "local3",
  hero_img: "http:/demo/frans.png",
  ordinal: "4",
});

const localDocument4: ContentDocument = wrapDocument({
  content: "# Mixes1",
  media_item: "http://localhost:3000/demo/StarWars3.wav",
  user_id: "local",
  playlist: "mixes",
  document_id: "local4",
  hero_img: "http:/demo/frans.png",
  ordinal: "4",
});

const localDocument5: ContentDocument = wrapDocument({
  content: "# Mixes2",
  media_item: "http://localhost:3000/demo/StarWars3.wav",
  user_id: "local",
  playlist: "mixes",
  document_id: "local5",
  hero_img: "http:/demo/frans.png",
  ordinal: "4",
});

export const localDocuments = [
  localDocument,
  localDocument2,
  localDocument3,
  localDocument4,
  localDocument5,
];
