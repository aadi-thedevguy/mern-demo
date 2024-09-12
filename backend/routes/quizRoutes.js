import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizReports,
  getUserQuizById,
} from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createQuiz);
router.get("/", protect, getQuizzes);
router.get("/edit/:id", protect, getUserQuizById);
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);
router.get("/:id/reports", protect, getQuizReports);
router.get("/:id", getQuizById); // public to get quiz for users
router.post("/submit/:id", submitQuiz); // public to submit quiz answers

export default router;
