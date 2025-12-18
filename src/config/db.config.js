import "dotenv/config";
import { Pool } from "pg";
import { createClient } from "redis";
import { QdrantClient } from "@qdrant/js-client-rest";

const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
});

pgPool.query(`
  CREATE TABLE IF NOT EXISTS interaction_logs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_query TEXT,
    llm_response TEXT,
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error("PG Error:", err));



const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on("error", err => console.error("Redis Error:", err));
await redisClient.connect();



const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL
});

export { pgPool, redisClient, qdrantClient };
