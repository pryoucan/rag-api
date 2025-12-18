import {
    ingestDocs,
    chat as chatService,
    getHistory as getHistoryService,
    clearHistory
} from "../services/rag.service";

export const ingest = async (req, res) => {
    try {
        const result = await ingestDocs();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const chat = async (req, res) => {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
        return res.status(400).json({ error: "sessionId and query required" });
    }

    try {
        const response = await chatService(sessionId, query);
        res.json({ response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getHistory = async (req, res) => {
    const { sessionId } = req.params;
    const history = await getHistoryService(sessionId);
    res.json({ history: history || "No history" });
};

export const deleteHistory = async (req, res) => {
    const { sessionId } = req.params;
    await clearHistory(sessionId);
    res.json({ message: "Session cleared" });
};
