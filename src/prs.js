import Cursor from './cursor';

/**
 * @param {ArrayBuffer} buffer buffer to decompress
 * @return {ArrayBuffer} decompressed output
 */
export function decompress(buffer) {
  let readCursor = new Cursor(buffer);
  let writeCursor = new Cursor();

  while (true) { // eslint-disable-line no-constant-condition
    let flag;

    flag = readCursor.readBit();
    if (flag) {
      // literal byte
      writeCursor.writeUint8(readCursor.readUint8());
      continue;
    }

    let offset = 0;
    let size = 0;
    let isLongCopy = false;

    flag = readCursor.readBit();
    if (flag) {
      isLongCopy = true;
      // long copy or eof
      offset = readCursor.readInt16(true);
      if (offset === 0) {
        break;
      }
      size = offset & 0x0007;
      offset >>= 3;
      if (size === 0) {
        size = readCursor.readUint8();
        size += 1;
      } else {
        size += 2;
      }

      offset |= 0xFFFFFFFFFFFFE000;
    } else {
      // short copy
      flag = readCursor.readBit() ? 1 : 0;
      size = readCursor.readBit() ? 1 : 0;
      size = (size | (flag << 1)) + 2;

      offset = readCursor.readInt8();
      if (offset > 0) offset = -offset;
    }

    // do the actual copy
    for (let i = 0; i < size; i++) {
      if (offset > 0) {
        throw new Error(`offset > 0 (${offset}) (isLongCopy === ${isLongCopy})`);
      }
      writeCursor.seek(offset);
      let newByte = writeCursor.readUint8();
      writeCursor.seek(-1);
      writeCursor.seek(-offset);
      writeCursor.writeUint8(newByte);
    }
  }

  return writeCursor.buffer.slice(0, writeCursor.pos);
}
