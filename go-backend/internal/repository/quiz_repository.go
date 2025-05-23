package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Quiz struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	Title     string              `bson:"title"`
	Questions []Question          `bson:"questions"`
	CreatedBy primitive.ObjectID  `bson:"created_by"`
	CreatedAt primitive.Timestamp `bson:"created_at,omitempty"`
	UpdatedAt primitive.Timestamp `bson:"updated_at,omitempty"`
}

type Question struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Text        string             `bson:"text"`
	Options     []string           `bson:"options"`
	CorrectAnswer int              `bson:"correct_answer"`
}

type QuizRepository struct {
	collection *mongo.Collection
}

func NewQuizRepository(collection *mongo.Collection) *QuizRepository {
	return &QuizRepository{collection: collection}
}

func (r *QuizRepository) CreateQuiz(ctx context.Context, quiz *Quiz) error {
	quiz.ID = primitive.NewObjectID()
	quiz.CreatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	quiz.UpdatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	_, err := r.collection.InsertOne(ctx, quiz)
	return err
}

func (r *QuizRepository) GetQuizzes(ctx context.Context, userId primitive.ObjectID) ([]Quiz, error) {
	var quizzes []Quiz
	cursor, err := r.collection.Find(ctx, bson.M{"created_by": userId})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var quiz Quiz
		if err := cursor.Decode(&quiz); err != nil {
			return nil, err
		}
		quizzes = append(quizzes, quiz)
	}

	return quizzes, cursor.Err()
}

func (r *QuizRepository) GetQuizById(ctx context.Context, id primitive.ObjectID) (*Quiz, error) {
	var quiz Quiz
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&quiz)
	return &quiz, err
}

func (r *QuizRepository) UpdateQuiz(ctx context.Context, id primitive.ObjectID, quiz *Quiz) error {
	quiz.UpdatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": id}, quiz)
	return err
}

func (r *QuizRepository) DeleteQuiz(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *QuizRepository) GetQuizReports(ctx context.Context, quizId primitive.ObjectID) ([]QuizReport, error) {
	var reports []QuizReport
	cursor, err := r.collection.Find(ctx, bson.M{"quiz_id": quizId})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var report QuizReport
		if err := cursor.Decode(&report); err != nil {
			return nil, err
		}
		reports = append(reports, report)
	}

	return reports, cursor.Err()
}

type QuizReport struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	QuizId    primitive.ObjectID  `bson:"quiz_id"`
	UserId    primitive.ObjectID  `bson:"user_id"`
	Score     int                `bson:"score"`
	CreatedAt primitive.Timestamp `bson:"created_at,omitempty"`
}

func (r *QuizRepository) CreateQuizReport(ctx context.Context, report *QuizReport) error {
	report.ID = primitive.NewObjectID()
	report.CreatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	_, err := r.collection.InsertOne(ctx, report)
	return err
}