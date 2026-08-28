/**
 * Helpers pour générer des fichiers de test
 * Génère PDF avec pdf-lib, images avec encodeur PNG (zlib + CRC32)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Créer un PNG de test (pur JS, pas besoin de node-canvas)
 */
function createPngBuffer(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data: each row starts with filter byte (0 = none)
  const rowLen = 1 + width * 3;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    const rowOff = y * rowLen;
    raw[rowOff] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = rowOff + 1 + x * 3;
      let r = 255,
        g = 255,
        b = 255;

      // Border
      if (x < 10 || x >= width - 10 || y < 10 || y >= height - 10) {
        r = g = b = 200;
      }

      // Center rectangle (red)
      const cx = width / 2,
        cy = height / 2;
      const rx = width / 4,
        ry = height / 4;
      if (Math.abs(x - cx) < rx && Math.abs(y - cy) < ry) {
        r = 220;
        g = 50;
        b = 50;
      }

      // Simulated text lines
      const lineSpacing = Math.max(20, Math.floor(height / 10));
      for (let line = 0; line < 8; line++) {
        const lineY = y - line * lineSpacing;
        if (lineY >= 0 && lineY < 5 && x > width * 0.2 && x < width * 0.8) {
          r = g = b = 50;
        }
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Créer un PDF de test simple
 */
export async function createTestPdf(options = {}) {
  const { pages = 1, filename = 'test-document.pdf', text = 'Test Document' } = options;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages; i++) {
    const page = pdfDoc.addPage([595, 842]); // A4
    page.drawText(`${text} - Page ${i + 1}`, {
      x: 50,
      y: 780,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    for (let j = 0; j < 20; j++) {
      page.drawText(`Line ${j + 1}: Lorem ipsum dolor sit amet.`, {
        x: 50,
        y: 740 - j * 20,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(fixturesDir, filename);
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}

export async function createMultiPagePdf(numPages = 5) {
  return createTestPdf({ pages: numPages, filename: 'multi-page-test.pdf' });
}

export async function createLongPdf() {
  return createTestPdf({ pages: 55, filename: 'long-document-55pages.pdf' });
}

/**
 * Créer un PNG de test
 */
export function createTestImage(options = {}) {
  const { width = 800, height = 600, filename = 'test-image.png' } = options;

  const pngData = createPngBuffer(width, height);
  const filePath = path.join(fixturesDir, filename);
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(filePath, pngData);
  return filePath;
}

export function createLargeImage() {
  return createTestImage({
    width: 2000,
    height: 2000,
    filename: 'large-image.png',
    text: 'Large Image 2000x2000',
  });
}

/**
 * Générer tous les fichiers de test
 */
export async function generateAllFixtures() {
  console.log('Generating test fixtures...');
  fs.mkdirSync(fixturesDir, { recursive: true });

  const files = {
    testPdf: await createTestPdf({ pages: 2, text: 'Test PDF Document' }),
    multiPagePdf: await createMultiPagePdf(5),
    longPdf: await createLongPdf(),
    testImagePng: createTestImage({
      width: 800,
      height: 600,
      filename: 'test-image.png',
      text: 'PNG Test',
    }),
    testImageJpg: createTestImage({
      width: 800,
      height: 600,
      filename: 'test-image.jpg',
      text: 'JPG Test',
    }),
    largeImage: createLargeImage(),
  };

  console.log('✅ Fixtures generated');
  return files;
}
