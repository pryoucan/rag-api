import axios from "axios";
import { chunkText } from "./chunker.service";
import { articles } from "./mock-news.services";
import { pgPool, redisClient, qdrantClient } from "../config/db.config";


const COLLECTION_NAME = "news_articles";

async function getEmbedding(text) {
    const response = await axios.post("https://api.jina.ai/v1/embeddings",
        {
            input: [text], model: "jina-embeddings-v2-base-en"
        },
        {
            headers: { Authorization: `Bearer ${}` }
        }
    );

    return response.data.data[0].embedding;
}

async function ingestDocs() {
    try {
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: { size: 768, distance: "Cosine" }
        });
    }
    catch (error) {
        console.log("Collection already exists", error);
    }

    let pointId = 1;
    const points = [];

    for (const article of articles) {
        const chunks = chunkText(article.content)

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await getEmbedding(chunks[i]);

            points.push({
                id: pointId++,
                vector: embedding,
                payload: {
                    articleId: article.id,
                    title: article.title,
                    text: chunks[i],
                    chunkIndex: i
                }
            });
        }
    }


    await qdrantClient.upsert(COLLECTION_NAME, { points });

    return { message: `Ingested ${articles.length} articles with chunking` };
}

async function chat(sessionId, userQuery) {
    const start = Date.now();

    const historyKey = `history:${sessionId}`;
    const pastHistory = await redisClient.get(historyKey) || "";

    const queryEmbedding = await getEmbedding(userQuery);

    const searchResults = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit: 5
    });

    const context = searchResults.map(r => r.payload.text)
    .join("\n\n");

    const prompt = `
    You are a news assistant. Answer ONLY using the context below.

    CONTEXT:
    ${context}

    CHAT HISTORY:
    ${pastHistory}

    QUESTION:
    ${userQuery}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    await redisClient.setEx(
        historyKey,
        3600,
        `${pastHistory}\nUser: ${userQuery}\nAI: ${answer}`
    );

    return answer;
}

async function getHistory(sessionId) {
    return await redisClient.get(`history:${sessionId}`);
}

async function clearHistory(sessionId) {
  await redisClient.del(`history:${sessionId}`);
}

export const { ingestDocs, chat, getHistory, clearHistory };
