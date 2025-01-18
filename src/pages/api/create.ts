import { randomUUID } from "crypto";

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "./lib/dynamodbClient";

const createHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, content } = req.body;
  let { document_id } = req.body;

  if (!document_id) {
    document_id = randomUUID();
  }

  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust this to be more restrictive if needed
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const data = await dynamoDBClient.send(
      new PutCommand({
        TableName: "lbsa71_net",
        Item: {
          user_id,
          document_id,
          content,
        },
      })
    );

    res.status(200).json({ message: "Post created", document_id, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

export default createHandler;
