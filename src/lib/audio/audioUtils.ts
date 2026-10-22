export function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.round(input.length / ratio);
  const output = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
    const frac = srcIndex - srcIndexFloor;
    output[i] = input[srcIndexFloor] * (1 - frac) + input[srcIndexCeil] * frac;
  }
  return output;
}

export function resampleInt16(input: Float32Array, fromRate: number, toRate: number): Int16Array {
  const resampled = resampleAudio(input, fromRate, toRate);
  const pcm16 = new Int16Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    pcm16[i] = Math.max(-1, Math.min(1, resampled[i])) * 0x7fff;
  }
  return pcm16;
}

export function parseSpokenPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  const words = phone.toLowerCase()
    .replace(/[-\(\)\+]/g, ' ')
    .split(/\s+/);
  
  const wordToDigit: { [key: string]: string } = {
    'zero': '0', 'one': '1', 'two': '2', 'to': '2', 'too': '2',
    'three': '3', 'four': '4', 'for': '4', 'five': '5', 'six': '6',
    'seven': '7', 'eight': '8', 'ate': '8', 'nine': '9', 'oh': '0', 'o': '0'
  };

  let result = "";
  let doubleNext = false;
  let tripleNext = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim();
    if (!word) continue;

    if (word === 'double' || word === 'duble') {
      doubleNext = true;
      continue;
    }
    if (word === 'triple' || word === 'tripple') {
      tripleNext = true;
      continue;
    }

    let digitStr = "";
    if (wordToDigit[word] !== undefined) {
      digitStr = wordToDigit[word];
    } else {
      digitStr = word.replace(/\D/g, '');
    }

    if (digitStr) {
      if (digitStr.length === 1) {
        if (doubleNext) {
          result += digitStr + digitStr;
          doubleNext = false;
        } else if (tripleNext) {
          result += digitStr + digitStr + digitStr;
          tripleNext = false;
        } else {
          result += digitStr;
        }
      } else {
        if (doubleNext) {
          result += digitStr[0] + digitStr;
          doubleNext = false;
        } else if (tripleNext) {
          result += digitStr[0] + digitStr[0] + digitStr;
          tripleNext = false;
        } else {
          result += digitStr;
        }
      }
    }
  }

  return result;
}
