import {P_TABLE, S_TABLE} from './consts';

function roundFunction(s, x) {
  let a = s[0][(x >>> 24)];
  let b = s[1][((x >>> 16) & 0xff)];
  let c = s[2][((x >>> 8) & 0xff)];
  let d = s[3][(x & 0xff)];
  let ret = (((a + b) ^ c) + d);
  return ret >>> 0;
}

export class BlowfishContext {
  /**
   * construct a blowfish context
   * @param {ArrayBuffer} key key as array of bytes. must be multiple of 4
   */
  constructor(key) {
    let keyData = new DataView(key);
    let len = Math.floor(key.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    let realKey = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      realKey[i] = keyData.getUint32(i * 4, false);
    }
    this._s = [
      S_TABLE[0].slice(),
      S_TABLE[1].slice(),
      S_TABLE[2].slice(),
      S_TABLE[3].slice(),
    ];
    this._p = P_TABLE.slice();
    this._key = realKey;

    this._keySchedule();
  }

  _keySchedule() {
    let keyPos = 0;
    for (let i = 0; i < 18; i++) {
      this._p[i] ^= this._key[keyPos % this._key.length];
      keyPos++;
    }

    let lr = new ArrayBuffer(8);
    let lrView = new DataView(lr);
    for (let i = 0; i < 18; i+=2) {
      this.encrypt(lr);
      this._p[i] = lrView.getUint32(0, true);
      this._p[i+1] = lrView.getUint32(4, true);
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 256; j+=2) {
        this.encrypt(lr);
        this._s[i][j] = lrView.getUint32(0, true);
        this._s[i][j+1] = lrView.getUint32(4, true);
      }
    }
  }

  /**
   * @param {ArrayBuffer} buffer buffer to encrypt. must be multiple of 8
   */
  encrypt(buffer) {
    let view = new DataView(buffer, 0, Math.floor(buffer.byteLength / 8) * 8);
    for (let i = 0; i < Math.floor(view.byteLength / 8); i++) {
      let l = view.getUint32(i * 8, true);
      let r = view.getUint32(i * 8 + 4, true);
      for (let ii = 0; ii < 16; ii+=2) {
        l ^= this._p[ii];
        r ^= roundFunction(this._s, l);
        r ^= this._p[ii+1];
        l ^= roundFunction(this._s, r);
      }
      l ^= this._p[16];
      r ^= this._p[17];
      view.setUint32(i * 8, r, true);
      view.setUint32(i * 8 + 4, l, true);
    }
  }

  /**
   * @param {ArrayBuffer} buffer buffer to decrypt. must be multiple of 8
   */
  decrypt(buffer) {
    let view = new DataView(buffer, 0, (Math.floor(buffer.byteLength / 8)) * 8);
    for (let i = 0; i < Math.floor(view.byteLength / 8); i++) {
      let l = view.getUint32(i * 8, true);
      let r = view.getUint32(i * 8 + 4, true);
      for (let ii = 16; ii > 0; ii-=2) {
        l ^= this._p[ii + 1];
        r ^= roundFunction(this._s, l);
        r ^= this._p[ii];
        l ^= roundFunction(this._s, r);
      }
      l ^= this._p[1];
      r ^= this._p[0];
      view.setUint32(i * 8, r, true);
      view.setUint32(i * 8 + 4, l, true);
    }
  }
}

export default BlowfishContext;
