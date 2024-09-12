import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";
import User from "../models/userModel.js";
import QuizSubmission from "../models/submissionModel.js";

let token, quizId;
const defaultQuiz = {
  title: "Default Quiz",
  description: "This is a default quiz",
  questions: [
    {
      question: "Question 1",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
    },
    {
      question: "Question 2",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
    },
    {
      question: "Question 3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
    },
    {
      question: "Question 4",
      options: ["A", "B", "C", "D"],
      correctAnswer: "D",
    },
    {
      question: "Question 5",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
    },
  ],
};
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // create admin user
  const admin = await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: "password",
  });
  const quiz = new Quiz({ ...defaultQuiz, user: admin._id });
  const savedQuiz = await quiz.save();
  quizId = savedQuiz._id;
  const res = await request(app)
    .post("/api/users/auth")
    .send({ email: "admin@example.com", password: "password" });
  token = res.body.token;
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany(),
    Quiz.deleteMany(),
    QuizSubmission.deleteMany(),
  ]);
  await mongoose.connection.close();
});

describe("Quiz API", () => {
  it("should create a new quiz", async () => {
    const res = await request(app)
      .post("/api/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Quiz created by admin",
        description: "This is a test quiz created by admin",
        questions: [
          {
            question: "Question 1",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
          {
            question: "Question 2",
            options: ["A", "B", "C", "D"],
            correctAnswer: "B",
          },
          {
            question: "Question 3",
            options: ["A", "B", "C", "D"],
            correctAnswer: "C",
          },
          {
            question: "Question 4",
            options: ["Admin", "B", "C", "D"],
            correctAnswer: "D",
          },
          {
            question: "Question 5",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
        ],
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("title", "Test Quiz created by admin");
  });

  it("should fetch all quizzes", async () => {
    const res = await request(app)
      .get("/api/quizzes")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should fetch a single quiz by ID", async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("title", "Default Quiz");
  });

  it("should update a quiz", async () => {
    const res = await request(app)
      .put(`/api/quizzes/${quizId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Test Quiz",
        description: "This is an updated test quiz",
        questions: [
          {
            question: "Updated Question 1",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
          {
            question: "Updated Question 2",
            options: ["A", "B", "C", "D"],
            correctAnswer: "B",
          },
          {
            question: "Updated Question 3",
            options: ["A", "B", "C", "D"],
            correctAnswer: "C",
          },
          {
            question: "Updated Question 4",
            options: ["A", "B", "C", "D"],
            correctAnswer: "D",
          },
          {
            question: "Updated Question 5",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
        ],
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("title", "Updated Test Quiz");
  });

  it("should submit a quiz", async () => {
    const res = await request(app)
      .post(`/api/quizzes/submit/${quizId}`)
      .send({
        name: "Visitor",
        answers: ["A", "B", "C", "D", "A"],
        timeTaken: 300,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("score");
    expect(res.body).toHaveProperty("percentage");
    expect(res.body).toHaveProperty("userAnswers");
    expect(res.body).toHaveProperty("timeTaken");
    expect(res.body).toHaveProperty("name");
  });

  it("should not allow the same visitor to submit the same quiz twice", async () => {
    const res = await request(app)
      .post(`/api/quizzes/submit/${quizId}`)
      .send({
        name: "Visitor",
        answers: ["A", "B", "C", "D", "A"],
        timeTaken: 300,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "message",
      "You have already submitted this quiz"
    );
  });

  it("should get quiz reports", async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}/reports`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
