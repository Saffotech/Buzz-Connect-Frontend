/**
 * Social media platform image dimension requirements
 * Each entry contains [width, height] in pixels
 */
const DIMENSIONS = {
  instagram: {
    square: [1080, 1080],
    vertical: [1080, 1350],
    landscape: [1080, 566],
    story: [1080, 1920],
    reel: [1080, 1920],
    profile: [320, 320]
  },
  facebook: {
    square: [1080, 1080],
    landscape: [1200, 630],
    portrait: [1080, 1350],
    profile: [400, 400]
  },
  linkedin: {
    horizontal: [1200, 627],
    square: [1080, 1080],
    portrait: [1080, 1350],
    carousel: [1920, 1080],
    profile: [400, 400]
  },
  youtube: {
    shorts: [1080, 1920],
    full: [1920, 1080],
    image: [1080, 1080],
    thumbnail: [1280, 720],
    profile: [800, 800]
  },
  twitter: {
    standard: [1200, 675],
    square: [1080, 1080],
    profile: [400, 400]
  }
};

export default DIMENSIONS;
