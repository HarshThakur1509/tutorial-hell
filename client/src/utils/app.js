

// Format time utility function
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedSecs = secs < 10 ? `0${secs}` : secs;
    const formattedMins = mins < 10 ? `0${mins}` : mins;

    return hrs > 0
        ? `${hrs}:${formattedMins}:${formattedSecs}`
        : `${mins}:${formattedSecs}`;
};


export { formatTime };