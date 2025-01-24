package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string `gorm:"unique;not null;index"`
	Password string
	Name     string
	Videos   []VideoData
}

type VideoData struct {
	gorm.Model
	WatchID  string
	Title    string
	Comments []Comment
	UserID   uint `gorm:"not null;index"`
}

type Comment struct {
	gorm.Model
	Body        string
	Timestamp   float64
	VideoDataID uint `gorm:"foreignKey:VideoDataID;constraint:OnDelete:CASCADE"`
}
