import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  answers: [{ type: String }],
  score: { type: Number },
  percentage: { type: Number },
  timeTaken: { type: String },
});

const QuizSubmission = mongoose.model("quiz-submission", quizSubmissionSchema);
export default QuizSubmission;
