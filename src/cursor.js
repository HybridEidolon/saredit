export class Cursor {
  constructor(buffer) {
    this.buffer = buffer || new ArrayBuffer(64);
    this.dataView = new DataView(this.buffer);
    this.pos = 0;
    this.bitCounter = 0;
    this.bitValue = 0;
  }

  extendIfNeeded(adding) {
    if (this.pos + adding > this.buffer.byteLength) {
      let newBuffer = new ArrayBuffer(this.buffer.byteLength * 2);
      let newBufferDataView = new DataView(newBuffer);
      for (let i = 0; i < this.buffer.byteLength; i++) {
        newBufferDataView.setUint8(i, this.dataView.getUint8(i));
      }
      this.buffer = newBuffer;
      this.dataView = newBufferDataView;
    }
  }

  readBit() {
    if (this.bitCounter === 0) {
      this.bitValue = this.dataView.getUint8(this.pos);
      this.seek(1);
      this.bitCounter = 8;
    }

    let bit = this.bitValue & 1;
    this.bitCounter -= 1;
    this.bitValue = this.bitValue >>> 1;
    return bit;
  }

  readUint8() {
    let ret = this.dataView.getUint8(this.pos);
    this.seek(1);
    return ret;
  }

  readUint16(le) {
    let ret = this.dataView.getUint16(this.pos, le === true ? true : false);
    this.seek(2);
    return ret;
  }

  readUint32(le) {
    let ret = this.dataView.getUint32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  readInt8() {
    let ret = this.dataView.getInt8(this.pos);
    this.seek(1);
    return ret;
  }

  readInt16(le) {
    let ret = this.dataView.getInt16(this.pos, le === true ? true : false);
    this.seek(2);
    return ret;
  }

  readInt32(le) {
    let ret = this.dataView.getInt32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  readFloat32(le) {
    let ret = this.dataView.getFloat32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  readFloat64(le) {
    let ret = this.dataView.getFloat64(this.pos, le === true ? true : false);
    this.seek(8);
    return ret;
  }

  writeUint8(v) {
    this.extendIfNeeded(1);
    this.dataView.setUint8(this.pos, v);
    this.seek(1);
  }

  writeUint16(v, le) {
    this.extendIfNeeded(2);
    this.dataView.setUint16(this.pos, v, le === true ? true : false);
    this.seek(2);
  }

  writeUint32(v, le) {
    this.extendIfNeeded(4);
    this.dataView.setUint32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  writeInt8(v) {
    this.extendIfNeeded(1);
    this.dataView.setInt8(this.pos, v);
    this.seek(1);
  }

  writeInt16(v, le) {
    this.extendIfNeeded(2);
    this.dataView.setInt16(this.pos, v, le === true ? true : false);
    this.seek(2);
  }

  writeInt32(v, le) {
    this.extendIfNeeded(4);
    this.dataView.setInt32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  writeFloat32(v, le) {
    this.extendIfNeeded(4);
    this.dataView.setFloat32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  writeFloat64(v, le) {
    this.extendIfNeeded(8);
    this.dataView.setFloat64(this.pos, v, le === true ? true : false);
    this.seek(8);
  }

  seek(offset) {
    if (this.pos + offset > this.buffer.byteLength || this.pos + offset < 0) {
      throw new Error(`invalid seek to ${this.pos + offset} (by ${offset}) on buffer of length ${this.buffer.byteLength}`);
    }
    this.pos += offset;
  }
}

export default Cursor;
