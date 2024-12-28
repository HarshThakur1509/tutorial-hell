import PropTypes from "prop-types";
export const VideoThumbnail = ({ src, alt, width, height }) => {
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
};
VideoThumbnail.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string,
};
