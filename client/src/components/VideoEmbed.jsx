import PropTypes from "prop-types";
import { memo } from "react";

const VideoEmbed = memo(({ width, height, src, title }) => {
  return (
    <div>
      <iframe
        width={width}
        height={height}
        src={src}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ maxWidth: width, maxHeight: height, aspectRatio: "16/9" }}
      ></iframe>
    </div>
  );
});

VideoEmbed.propTypes = {
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

// Set displayName for the memoized component
VideoEmbed.displayName = "VideoEmbed";

export { VideoEmbed };
