import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizReports,
} from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createQuiz);
router.get("/", protect, getQuizzes);
router.get("/:id", getQuizById); // public to get quiz for users
router.post("/submit/:id", submitQuiz); // public to submit quiz answers
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);
router.get("/:id/reports", protect, getQuizReports);

export default router;
