// AudioWorklet: downsamples mic audio to 16 kHz mono PCM16 and posts ~40 ms chunks.
class PCMCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000; // sampleRate is the context's rate (global)
    this.pos = 0; // fractional read position in the input stream
    this.carry = new Float32Array(0);
    this.out = new Int16Array(640); // 40 ms @ 16 kHz
    this.outLen = 0;
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;

    // Concatenate leftover samples with the new block.
    const buf = new Float32Array(this.carry.length + ch.length);
    buf.set(this.carry, 0);
    buf.set(ch, this.carry.length);

    // Linear-interpolating resampler.
    let p = this.pos;
    while (p + 1 < buf.length) {
      const i = Math.floor(p);
      const f = p - i;
      const s = buf[i] * (1 - f) + buf[i + 1] * f;
      this.out[this.outLen++] = Math.max(-1, Math.min(1, s)) * 32767;
      if (this.outLen === this.out.length) {
        const copy = this.out.slice(0);
        this.port.postMessage(copy.buffer, [copy.buffer]);
        this.outLen = 0;
      }
      p += this.ratio;
    }
    const consumed = Math.floor(p);
    this.carry = buf.slice(consumed);
    this.pos = p - consumed;
    return true;
  }
}
registerProcessor("pcm-capture", PCMCapture);
