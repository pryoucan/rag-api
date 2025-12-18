import { Router } from "express";
import {
    ingest,
    chat,
    getHistory,
    deleteHistory
} from "../controllers/rag-api.controller";

const router = Router();

router.post("/ingest", ingest);
router.post("/chat", chat);
router.get("/history/:sessionId", getHistory);
router.delete("/history/:sessionId", deleteHistory);

export default router;
