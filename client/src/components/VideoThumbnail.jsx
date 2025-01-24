import PropTypes from "prop-types";
import { memo } from "react";

const VideoThumbnail = memo(({ src, alt, width, height }) => {
  return (
    <div>
      <img
        src={`https://img.youtube.com/vi/${src}/hqdefault.jpg`}
        alt={alt}
        style={{
          width: "100%",
          maxWidth: width,
          height: "100%",
          maxHeight: height,
        }}
      />
    </div>
  );
});

VideoThumbnail.propTypes = {
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

// Set displayName for the memoized component
VideoThumbnail.displayName = "VideoThumbnail";

export { VideoThumbnail };
