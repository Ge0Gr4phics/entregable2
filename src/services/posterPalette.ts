import { decode } from 'jpeg-js';

export interface PosterPalette {
  dominant: string;
}

const paletteCache = new Map<string, PosterPalette>();
const MAX_CACHE_SIZE = 24;
const MAX_SAMPLES = 1400;

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

function colorToHex(red: number, green: number, blue: number): string {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export async function getPosterPalette(imageUrl: string): Promise<PosterPalette> {
  const cachedPalette = paletteCache.get(imageUrl);
  if (cachedPalette) {
    return cachedPalette;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el póster (${response.status}).`);
  }

  const imageBytes = new Uint8Array(await response.arrayBuffer());
  const image = decode(imageBytes, {
    useTArray: true,
    formatAsRGBA: true,
    maxResolutionInMP: 1,
    maxMemoryUsageInMB: 32,
  });
  const histogram = new Map<number, { count: number; red: number; green: number; blue: number }>();
  const pixelCount = image.width * image.height;
  const sampleStride = Math.max(4, Math.ceil(pixelCount / MAX_SAMPLES) * 4);

  for (let offset = 0; offset < image.data.length; offset += sampleStride) {
    const alpha = image.data[offset + 3];
    if (alpha < 200) {
      continue;
    }

    const red = image.data[offset];
    const green = image.data[offset + 1];
    const blue = image.data[offset + 2];
    const key = ((red >> 3) << 10) | ((green >> 3) << 5) | (blue >> 3);
    const bucket = histogram.get(key);

    if (bucket) {
      bucket.count += 1;
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
    } else {
      histogram.set(key, { count: 1, red, green, blue });
    }
  }

  const buckets = Array.from(histogram.values());
  if (buckets.length === 0) {
    throw new Error('No se encontraron colores válidos en el póster.');
  }

  buckets.sort((first, second) => second.count - first.count);
  const dominant = buckets[0];
  const palette = {
    dominant: colorToHex(dominant.red / dominant.count, dominant.green / dominant.count, dominant.blue / dominant.count),
  };

  if (paletteCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = paletteCache.keys().next().value;
    if (oldestKey) {
      paletteCache.delete(oldestKey);
    }
  }
  paletteCache.set(imageUrl, palette);
  return palette;
}
