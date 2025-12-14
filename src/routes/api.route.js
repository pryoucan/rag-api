import { Router } from "express";
import { chat, deleteHistory, getHistory, ingest } from "../controllers/rag-api.controller";

export const router = Router();

router.post('/ingest', ingest);
router.post('/chat', chat);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', deleteHistory);