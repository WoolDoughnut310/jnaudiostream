# jnaudiostream

HTML5 audio streamer library for live streaming microphone and receiving, based off [sfmediastream](https://github.com/ScarletsFiction/SFMediaStream). The transmitted data is compressed (depend on the browser media encoder) before being sent to node server, and the latency is configurable.

## Install with CDN link

You can download minified js from this repository or use the CDN link

```html
<script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/jnaudiostream@1.0.0"
></script>
```

## Install with NPM

```
npm i sfmediastream
```

## Use the library

```javascript
// ES Modules
import { AudioRecorder, AudioStreamer } from "jnaudiostream";

// CommonJS
const { AudioRecorder, AudioStreamer } = require("jnaudiostream");

const recorder = new AudioRecorder(...);
const streamer = new AudioStreamer(...);
```

This is for web bundler like Webpack or Browserify, and can't be used as a library for Node.js. If you want to use this recorder/effect/plugin for Node.js, the I think it may be possible by using headless browser like Puppeteer.

## How to use

### AudioRecorder

This class is used for streaming the microphone to the server.

### Properties

| Property       | Details                                                   |
| -------------- | --------------------------------------------------------- |
| debug          | Set to true for outputting any message to browser console |
| mediaRecorder  | Return current `mediaRecorder` that being used            |
| mediaStream    | Return current `mediaStream` that being used              |
| mediaGranted   | Return true if user granted the recorder                  |
| recordingReady | Return true if the recording was ready                    |
| recording      | Return true if currently recording                        |

```js
// Example for accessing the properties
recorder.debug = true;
```

### Method

| Function       | Arguments | Description                          |
| -------------- | --------- | ------------------------------------ |
| startRecording | `()`      | Start recording camera or microphone |
| stopRecording  | `()`      | Stop recording camera or microphone  |

#### Event Listener

##### onReady

Callback when the library is ready for recording

```js
recorder.onReady = function (packet) {
    console.log("Header size: " + packet.data.size);
    mySocket.emit("bufferHeader", packet);
};
```

##### onBuffer

Callback when data buffer is ready to be played

```js
recorder.onBuffer = function (packet) {
    console.log("Data", packet);
    mySocket.emit("stream", packet);
};
```

### Example

```js
const recorder = new AudioRecorder(
    {
        /* audio:{
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: false,
    } */
    },
    1000
); // 1sec

recorder.onRecordingReady = function (packet) {
    console.log("Recording started!");
    console.log("Header size: " + packet.data.size + "bytes");

    // Every new streamer must receive this header packet
    mySocket.emit("bufferHeader", packet);
};

recorder.onBufferProcess = function (packet) {
    console.log("Buffer sent: " + packet[0].size + "bytes");
    mySocket.emit("stream", packet);
};

recorder.startRecording();

setTimeout(function () {
    recorder.stopRecording();
}, 5000);
```

## AudioStreamer

This class is used for buffering and playing microphone stream from the server.

```js
// The minimum duration for audio is ~100ms
var audioStreamer = new AudioStreamer(1000); // 1sec
```

### Properties

| Property | Details                                                   |
| -------- | --------------------------------------------------------- |
| debug    | Set to true for outputting any message to browser console |
| playing  | Return true if playing a stream                           |
| latency  | Return current latency                                    |
| mimeType | Return mimeType of current streamed media                 |

```js
// Example for accessing the properties
audioStreamer.debug = true;
```

### Method

| Function        | Arguments        | Description                                                       |
| --------------- | ---------------- | ----------------------------------------------------------------- |
| playStream      | `()`             | Set this library to automatically play any received buffer        |
| setBufferHeader | `(bufferHeader)` | Receive buffer header containing mimeType and `ArrayBuffer` data  |
| receiveBuffer   | `(packetBuffer)` | Receive arrayBuffer and play it when last buffer finished playing |
| stop            | `()`             | Stop playing any buffer                                           |

### Example

```js
var audioStreamer = new AudioStreamer(1000); // 1sec
audioStreamer.playStream();

// First thing that must be received
mySocket.on("bufferHeader", function (packet) {
    audioStreamer.setBufferHeader(packet);
});

mySocket.on("stream", function (packet) {
    console.log("Buffer received: " + packet[0].byteLength + "bytes");
    audioStreamer.receiveBuffer(packet);
});
```

## Contribution

If you want to help `jnaudiostream` please fork this project and edit on your repository, then make a pull request to here.

### Compile from source

After you downloaded this repo you need to install the devDependencies.

```
$ npm i
$ tsc -w
```

After you make some changes on `/src` it will automatically compile into `/dist/`. Make sure you cleared your cache before doing experiments.

## License

`jnaudiostream` is under the MIT license.

But don't forget to add a link to this repository.
