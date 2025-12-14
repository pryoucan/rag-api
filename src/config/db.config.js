import { Pool } from "pg";
import { createClient } from "redis";
import { QdrantClient } from "@qdrant/js-client-rest";

const pgPool = new Pool({
})

pgPool.query(`
    CREATE TABLE IF NOT EXISTS interaction_logs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_query TEXT,
    llm_response TEXT,
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`).catch(err => console.error("PG Error: ", err));

const redisClient = createClient({
    ulr: `redis://${}`
});

redisClient.connect().catch(console.error);

const qdrantClient = new QdrantClient({});

export { pgPool, redisClient, qdrantClient };