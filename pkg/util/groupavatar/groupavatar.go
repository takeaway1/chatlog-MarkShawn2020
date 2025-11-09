package groupavatar

import (
	"crypto/md5"
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"sync"
)

const (
	// DefaultSize is the default output size for group avatars
	DefaultSize = 200
	// DefaultGap is the default gap between avatar tiles
	DefaultGap = 2
)

// Generator generates group avatars from member avatars
type Generator struct {
	size int
	gap  int
}

// NewGenerator creates a new group avatar generator
func NewGenerator(size, gap int) *Generator {
	if size <= 0 {
		size = DefaultSize
	}
	if gap < 0 {
		gap = DefaultGap
	}
	return &Generator{
		size: size,
		gap:  gap,
	}
}

// Generate creates a composite avatar from member avatar URLs
// memberAvatarURLs: list of member avatar URLs (max 9)
// Returns the generated image
func (g *Generator) Generate(memberAvatarURLs []string) (image.Image, error) {
	if len(memberAvatarURLs) == 0 {
		return nil, fmt.Errorf("no member avatars provided")
	}

	// Limit to 9 avatars
	count := len(memberAvatarURLs)
	if count > 9 {
		count = 9
		memberAvatarURLs = memberAvatarURLs[:9]
	}

	// Download avatars concurrently
	avatars, err := g.downloadAvatars(memberAvatarURLs)
	if err != nil {
		return nil, err
	}

	// Filter out failed downloads
	validAvatars := make([]image.Image, 0, len(avatars))
	for _, avatar := range avatars {
		if avatar != nil {
			validAvatars = append(validAvatars, avatar)
		}
	}

	if len(validAvatars) == 0 {
		return nil, fmt.Errorf("no valid avatars downloaded")
	}

	// Determine grid layout
	gridSize := g.calculateGridSize(len(validAvatars))

	// Calculate tile size
	tileSize := (g.size - (gridSize-1)*g.gap) / gridSize

	// Create output image with white background
	output := image.NewRGBA(image.Rect(0, 0, g.size, g.size))
	draw.Draw(output, output.Bounds(), &image.Uniform{image.White}, image.Point{}, draw.Src)

	// Composite avatars
	for i, avatar := range validAvatars {
		row := i / gridSize
		col := i % gridSize

		x := col * (tileSize + g.gap)
		y := row * (tileSize + g.gap)

		// Resize avatar to tile size using simple nearest neighbor
		resized := g.resizeImage(avatar, tileSize, tileSize)

		// Draw onto output
		rect := image.Rect(x, y, x+tileSize, y+tileSize)
		draw.Draw(output, rect, resized, image.Point{}, draw.Src)
	}

	return output, nil
}

// resizeImage resizes an image using nearest neighbor algorithm
func (g *Generator) resizeImage(src image.Image, width, height int) image.Image {
	srcBounds := src.Bounds()
	dst := image.NewRGBA(image.Rect(0, 0, width, height))

	xRatio := float64(srcBounds.Dx()) / float64(width)
	yRatio := float64(srcBounds.Dy()) / float64(height)

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			srcX := int(float64(x) * xRatio)
			srcY := int(float64(y) * yRatio)
			dst.Set(x, y, src.At(srcBounds.Min.X+srcX, srcBounds.Min.Y+srcY))
		}
	}

	return dst
}

// calculateGridSize determines the grid size based on avatar count
func (g *Generator) calculateGridSize(count int) int {
	switch {
	case count == 1:
		return 1
	case count <= 4:
		return 2
	default:
		return 3
	}
}

// downloadAvatars downloads avatar images concurrently
func (g *Generator) downloadAvatars(urls []string) ([]image.Image, error) {
	var wg sync.WaitGroup
	results := make([]image.Image, len(urls))

	for i, url := range urls {
		wg.Add(1)
		go func(idx int, avatarURL string) {
			defer wg.Done()

			img, err := g.downloadImage(avatarURL)
			if err != nil {
				// Log error but continue with other avatars
				results[idx] = nil
				return
			}
			results[idx] = img
		}(i, url)
	}

	wg.Wait()

	return results, nil
}

// downloadImage downloads an image from URL
func (g *Generator) downloadImage(url string) (image.Image, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	// Try to decode image
	img, _, err := image.Decode(resp.Body)
	if err != nil {
		// Try PNG specifically
		resp.Body.Close()
		resp, err = http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		img, err = png.Decode(resp.Body)
		if err != nil {
			// Try JPEG
			resp.Body.Close()
			resp, err = http.Get(url)
			if err != nil {
				return nil, err
			}
			defer resp.Body.Close()

			img, err = jpeg.Decode(resp.Body)
			if err != nil {
				return nil, fmt.Errorf("failed to decode image: %w", err)
			}
		}
	}

	return img, nil
}

// GenerateHash generates a hash for caching based on member avatar URLs
func GenerateHash(memberAvatarURLs []string) string {
	h := md5.New()
	for _, url := range memberAvatarURLs {
		io.WriteString(h, url)
	}
	return fmt.Sprintf("%x", h.Sum(nil))
}
