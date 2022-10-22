import MediaBuffer from "./MediaBuffer";

export class AudioStreamer {
    chunksDuration: number;
    chunksSeconds: number;
    debug: boolean;
    playing: boolean;
    latency: number;
    mimeType?: string;
    onStop?: () => void;
    audioContext: AudioContext;
    audioElement: HTMLAudioElement;

    mediaBuffer?: ReturnType<typeof MediaBuffer>;

    constructor(chunksDuration?: number) {
        this.chunksDuration = chunksDuration ?? 1000;
        this.chunksSeconds = this.chunksDuration / 1000;
        this.audioContext = new AudioContext();

        this.debug = false;
        this.playing = false;
        this.latency = 0;
        this.audioElement = new Audio();
    }

    stop() {
        if (!this.mediaBuffer) return;
        this.playing = false;
        this.onStop?.();
    }

    setBufferHeader(packet: {
        mimeType: string;
        data: ArrayBuffer;
        startTime: number;
    }) {
        if (!packet.data) {
            return;
        }

        const arrayBuffer = packet.data;
        this.mimeType = packet.mimeType;

        this.mediaBuffer?.stop();

        this.mediaBuffer = MediaBuffer(
            arrayBuffer,
            this.mimeType,
            this.chunksDuration
        );

        this.audioElement.src = this.mediaBuffer.objectURL;
    }

    playStream() {
        this.playing = true;
    }

    receiveBuffer(packet: [ArrayBuffer, number]) {
        if (!this.playing || !this.mediaBuffer?.append) return;

        const arrayBuffer = packet[0];
        const streamingTime = packet[1];

        this.mediaBuffer.append(arrayBuffer);

        if (this.audioElement.paused) this.audioElement.play();

        this.latency =
            Number(String(Date.now()).slice(-5, -3)) -
            streamingTime +
            this.audioContext.baseLatency +
            this.chunksSeconds;
        if (this.debug) console.log("Total latency: " + this.latency);
    }
}
