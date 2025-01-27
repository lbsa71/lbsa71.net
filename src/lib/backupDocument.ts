import { PutCommand, GetCommand, dynamoDb } from "./dynamodb";

type DocumentData = {
    user_id: string;
    document_id: string;
    content?: string;
    hero_img?: string;
    media_item?: any;
    playlist?: any;
    ordinal?: number;
};

export const backupDocument = async (data: DocumentData) => {
    const version_id = new Date().toISOString();

    await dynamoDb.send(
        new PutCommand({
            TableName: "lbsa71_net_backup",
            Item: {
                user_id: data.user_id,
                document_id: data.document_id,
                versionId: version_id,
                content: data.content,
                hero_img: data.hero_img,
                media_item: data.media_item,
                playlist: data.playlist,
                ordinal: data.ordinal,
            },
        })
    );

    return version_id;
};

export const getDocumentForBackup = async (user_id: string, document_id: string) => {
    const result = await dynamoDb.send(
        new GetCommand({
            TableName: "lbsa71_net",
            Key: { user_id, document_id },
        })
    );

    return result.Item as DocumentData | undefined;
};
