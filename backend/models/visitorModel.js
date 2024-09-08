import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quizResults: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      answers: [{ type: String }],
      score: { type: Number },
      percentage: { type: Number },
      timeTaken: { type: Number },
    },
  ],
});

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;
