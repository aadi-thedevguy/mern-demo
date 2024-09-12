import asyncHandler from "express-async-handler";
import Quiz from "../models/quizModel.js";
import QuizSubmission from "../models/submissionModel.js";

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;

  // if (questions.length < 1) {
  if (questions.length < 5) {
    res.status(400);
    throw new Error("A quiz must have at least 5 questions");
  }

  const quiz = new Quiz({ user: req.user._id, title, description, questions });
  const createdQuiz = await quiz.save();
  res.status(201).json(createdQuiz);
});

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id });
  res.status(200).json(quizzes);
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = asyncHandler(async (req, res) => {
  const quizId = req.params.id;
  if (!quizId) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  const quiz = await Quiz.findById(quizId).select("-questions.correctAnswer");

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  return res.status(200).json(quiz);
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Protected
const getUserQuizById = asyncHandler(async (req, res) => {
  const quizId = req.params.id;
  if (!quizId) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  return res.status(200).json(quiz);
});

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
const updateQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  if (quiz.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this quiz");
  }

  quiz.title = title || quiz.title;
  quiz.description = description || quiz.description;
  quiz.questions = questions || quiz.questions;

  const updatedQuiz = await quiz.save();
  res.status(200).json(updatedQuiz);
});

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  if (quiz.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this quiz");
  }

  await Quiz.deleteOne({ _id: quiz._id });
  res.status(200).json({ message: "Quiz deleted successfully" });
});

// @desc    Submit a quiz
// @route   POST /api/quizzes/:id/submit
// @access  Public
const submitQuiz = asyncHandler(async (req, res) => {
  const { name, answers, timeTaken } = req.body;
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const existingVisitor = await QuizSubmission.findOne({
    name,
    quizId: quiz._id,
  });
  if (existingVisitor) {
    res.status(400);
    throw new Error("You have already submitted this quiz");
  }

  const correctAnswers = quiz.questions.map((q) => q.correctAnswer);
  const score = answers.filter(
    (answer, index) => answer === correctAnswers[index]
  ).length;
  const percentage = (score / correctAnswers.length).toFixed(2) * 100;
  const record = new QuizSubmission({
    name,
    quizId: quiz._id,
    answers,
    score,
    percentage,
    timeTaken,
  });
  await record.save();

  res.status(200).json({
    score,
    percentage,
    userAnswers: answers.length,
    name,
    timeTaken,
  });
});

// @desc    Get quiz reports
// @route   GET /api/quizzes/:id/reports
// @access  Private/Admin
const getQuizReports = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const reports = await QuizSubmission.find({ quizId: quiz._id });

  res.status(200).json(reports);
});

export {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizReports,
  getUserQuizById,
};
