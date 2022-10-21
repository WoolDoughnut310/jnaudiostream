const MediaBuffer = (
    bufferHeader: BufferSource,
    mimeType: string,
    chunksDuration?: number
) => {
    const source = new MediaSource();
    const objectURL = URL.createObjectURL(source);

    var removing = false;
    var totalTime = 0; // miliseconds
    var sourceBuffer: SourceBuffer | null = null;
    var buffers: ArrayBuffer[] = [];

    source.onsourceopen = function () {
        sourceBuffer = source.addSourceBuffer(mimeType);
        sourceBuffer.mode = "sequence";
        sourceBuffer.appendBuffer(bufferHeader);

        sourceBuffer.onerror = function (e) {
            console.error("SourceBuffer error:", e);
        };

        sourceBuffer.onupdateend = () => {
            if (removing) {
                removing = false;
                totalTime = 10000;

                // 0 ~ 10 seconds
                sourceBuffer?.remove(0, 10);
                return;
            }

            if (!sourceBuffer?.updating && buffers.length !== 0) {
                const buffer = buffers.shift();
                if (buffer) {
                    startAppending(buffer);
                }
            }
        };
    };

    const startAppending = (buffer: ArrayBuffer) => {
        sourceBuffer?.appendBuffer(buffer);
        totalTime += chunksDuration ?? 1000;
        // console.log(totalTime, buffer);
    };

    const append = (arrayBuffer: ArrayBuffer) => {
        if (sourceBuffer === null) return false;

        if (!sourceBuffer.updating && sourceBuffer.buffered.length === 2)
            // The problem of accessing to 'sourceBuffer.buffered' is that after you append data, the SourceBuffer instance becomes temporarily unusable while it's working.
            // During this time, the SourceBuffer's updating property will be set to true, so it's easy to check for.
            console.log("something wrong");

        if (totalTime >= 20000) removing = true;

        if (!sourceBuffer.updating) startAppending(arrayBuffer);
        else buffers.push(arrayBuffer);

        return totalTime / 1000;
    };

    const stop = function () {
        if (sourceBuffer?.updating) sourceBuffer?.abort();

        if (source.readyState === "open") source.endOfStream();
    };

    return { objectURL, append, stop };
};

export default MediaBuffer;
