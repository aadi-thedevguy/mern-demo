package repository

import (
	"app/internal/helpers"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	Name      string              `bson:"name"`
	Email     string              `bson:"email"`
	Password  string              `bson:"password"`
	CreatedAt primitive.Timestamp `bson:"created_at,omitempty"`
	UpdatedAt primitive.Timestamp `bson:"updated_at,omitempty"`
}

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(collection *mongo.Collection) *UserRepository {
	return &UserRepository{collection: collection}
}

func (r *UserRepository) InsertUser(ctx context.Context, user *User) error {
	user.ID = primitive.NewObjectID()
	user.CreatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	user.UpdatedAt = primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0}
	hashedPassword, err := helpers.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	_, error := r.collection.InsertOne(ctx, user)
	if error != nil {
		return error
	}
	return nil
}

func (r *UserRepository) FindUserByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	return &user, err
}
