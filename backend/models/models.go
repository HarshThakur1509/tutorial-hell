package models

import "gorm.io/gorm"

type VideoData struct {
	gorm.Model
	WatchID  string
	Title    string
	Comments []Comment
}

type Comment struct {
	gorm.Model
	Body        string
	Timestamp   float64
	VideoDataID uint
}
