import axios from "axios";
import { chunkText } from "./chunker.service";
import { articles } from "./mock-news.services";
import { pgPool, redisClient, qdrantClient } from "../config/db.config";

const COLLECTION_NAME = "news_articles";

async function getEmbedding(text) {
    const response = await axios.post(
        "https://api.jina.ai/v1/embeddings",
        {
            input: [text],
            model: "jina-embeddings-v2-base-en"
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.JINA_API_KEY}`
            }
        }
    );
    return response.data.data[0].embedding;
}




async function callLLM(prompt) {
    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: "Answer only using provided context." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            max_tokens: 500
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.choices[0].message.content;
}




async function ingestDocs() {
    try {
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: { size: 768, distance: "Cosine" }
        });
    } catch {
        console.log("Collection already exists");
    }

    let id = 1;
    const points = [];

    for (const article of articles) {
        const chunks = chunkText(article.content);

        for (let i = 0; i < chunks.length; i++) {
            const vector = await getEmbedding(chunks[i]);
            points.push({
                id: id++,
                vector,
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




async function chat(sessionId, query) {
    const start = Date.now();
    const historyKey = `history:${sessionId}`;
    const pastHistory = (await redisClient.get(historyKey)) || "";

    const queryVector = await getEmbedding(query);

    const results = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryVector,
        limit: 5
    });

    const context = results.map(r => r.payload.text).join("\n\n");

    const prompt = `
CONTEXT:
${context}

CHAT HISTORY:
${pastHistory}

QUESTION:
${query}
`;

    const answer = await callLLM(prompt);

    await redisClient.setEx(
        historyKey,
        3600,
        `${pastHistory}\nUser: ${query}\nAI: ${answer}`
    );

    await pgPool.query(
        "INSERT INTO interaction_logs(session_id, user_query, llm_response, response_time_ms) VALUES ($1,$2,$3,$4)",
        [sessionId, query, answer, Date.now() - start]
    );

    return answer;
}

async function getHistory(sessionId) {
    return redisClient.get(`history:${sessionId}`);
}

async function clearHistory(sessionId) {
    await redisClient.del(`history:${sessionId}`);
}

export { ingestDocs, chat, getHistory, clearHistory };
