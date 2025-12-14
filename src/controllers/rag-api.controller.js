import { chat, clearHistory, ingestDocs } from "../services/rag.service"

export const ingest = async (req, res) => {
    try {
        const result = await ingestDocs();
        res.json(result);
    }
    catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const chat = async (req, res) => {
    const { sessionId, query } = req.body;
    if(!sessionId || !query) {
        return res.status(400).json({ error: "Missing sessionId or query" });
    }

    try {
        const response = await chat(sessionId, query);
        res.json({ response });
    }
    catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export const getHistory = async (req, res) => {
  const { sessionId } = req.params;
  const history = await getHistory(sessionId);
  res.json({ history: history || "No history found" });
};

export const deleteHistory = async (req, res) => {
  const { sessionId } = req.params;
  await clearHistory(sessionId);
  res.json({ message: "Session cleared" });
};