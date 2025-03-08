import SHA256 from "crypto-js/sha256";

export class SecureAudioStream {
  private readonly mediaSource: MediaSource;
  private sourceBuffer: SourceBuffer | null = null;
  private readonly audioElement: HTMLAudioElement;
  private readonly token: string;
  private readonly sessionId: string;
  private readonly fileId: string;
  private readonly baseUrl: string;

  constructor(
    audioElement: HTMLAudioElement,
    token: string,
    sessionId: string,
    fileId: string,
  ) {
    this.audioElement = audioElement;
    this.token = token;
    this.sessionId = sessionId;
    this.fileId = fileId;
    this.baseUrl = "/api/audio/stream";
    this.mediaSource = new MediaSource();

    this.audioElement.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener("sourceopen", this.sourceOpen.bind(this));
  }

  private async sourceOpen() {
    try {
      this.sourceBuffer = this.mediaSource.addSourceBuffer("audio/mpeg");
      await this.fetchAndPlayAudio();
    } catch (error) {
      console.error("Error setting up audio source:", error);
    }
  }

  private async fetchAndPlayAudio() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.fileId}`, {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const startHeader = response.headers.get("X-Stream-Start");
      const timestampHeader = response.headers.get("X-Stream-Timestamp");
      const start = startHeader ? parseInt(startHeader, 10) : 0;
      const timestamp = timestampHeader
        ? parseInt(timestampHeader, 10)
        : Math.floor(Date.now() / 10000);

      const arrayBuffer = await response.arrayBuffer();
      const decryptedBuffer = this.decryptBuffer(arrayBuffer, start, timestamp);

      if (this.sourceBuffer) {
        this.sourceBuffer.addEventListener("updateend", () => {
          if (
            !this.sourceBuffer?.updating &&
            this.mediaSource.readyState === "open"
          ) {
            this.mediaSource.endOfStream();
          }
        });

        this.sourceBuffer.appendBuffer(decryptedBuffer);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  }

  private decryptBuffer(
    buffer: ArrayBuffer,
    start: number,
    timestamp: number,
  ): ArrayBuffer {
    const keyInput = `${this.sessionId}-${timestamp}-${start}`;
    const encryptionKey = this.generateKey(keyInput);
    console.log(
      "Decryption key input:",
      keyInput,
      "Encryption key:",
      encryptionKey,
    );

    const data = new Uint8Array(buffer);
    const decrypted = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      decrypted[i] =
        data[i] ^ parseInt(encryptionKey.substring(i % 32, (i % 32) + 1), 16);
    }

    return decrypted.buffer;
  }

  private generateKey(input: string): string {
    const hash = SHA256(input).toString();
    return hash.substring(0, 32);
  }
}
