package controllers

import (
	"fmt"
	"net/url"
)

func getWatchID(youtubeURL string) (string, error) {
	parsedURL, err := url.Parse(youtubeURL)
	if err != nil {
		return "", fmt.Errorf("invalid URL: %v", err)
	}

	// Extract query parameters
	queryParams := parsedURL.Query()
	watchID := queryParams.Get("v")
	if watchID == "" {
		return "", fmt.Errorf("no watch ID found in the URL")
	}

	return watchID, nil
}
