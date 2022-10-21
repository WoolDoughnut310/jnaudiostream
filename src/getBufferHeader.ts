const BufferHeader: { [key: string]: any } = {
    "audio/webm;codecs=opus":
        "GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ2hyb21lV0GGQ2hyb21lFlSua7+uvdeBAXPFh7o5nyc1kHqDgQKGhkFfT1BVU2Oik09wdXNIZWFkAQIAAIC7AAAAAADhjbWERzuAAJ+BAmJkgSAfQ7Z1Af/////////ngQCjjIEAAID/A//+//7//qM=",
};

export default function getBufferHeader(type: string) {
    if (!("chrome" in window) && type === "audio/webm;codecs=opus") {
        // this header is only for chrome based brosers
        return false;
    }

    if (!(type in BufferHeader)) return false;

    let buffer = BufferHeader[type];

    if (buffer.constructor === Blob) return buffer;

    buffer = window.atob(buffer);

    var UInt = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; i++) UInt[i] = buffer.charCodeAt(i);

    return (BufferHeader[type] = new Blob([UInt]));
}
