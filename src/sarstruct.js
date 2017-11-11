import * as struct from './struct';

export const pointSchema = {
  x: 'u8',
  y: 'u8',
};

export const layerSchema = {
  points: {
    topLeft: pointSchema,
    bottomLeft: pointSchema,
    topRight: pointSchema,
    bottomRight: pointSchema,
  },
  props: (cursor, registry) => {
    let val1 = struct.parseWithCursor(cursor, 'u32le', registry);
    let val2 = struct.parseWithCursor(cursor, 'u32le', registry);

    let visible = (val1 >> 31) & 1 > 0 ? false : true;
    let textureIndex = (val1 >> 21) & 1023;
    let transparency = (val1 >> 18) & 7;
    let colorR = (val1 >> 0) & 63;
    let colorG = (val1 >> 6) & 63;
    let colorB = (val1 >> 12) & 63;

    let colorX = (val2 >> 0) & 63;
    let colorY = (val2 >> 6) & 63;
    let colorZ = (val2 >> 12) & 63;

    return {
      visible,
      textureIndex,
      transparency,
      colorR,
      colorG,
      colorB,
      colorX,
      colorY,
      colorZ,
    };
  },
};

export const schema = (cursor, registry) => {
  let authorId = struct.parseWithCursor(cursor, 'u32le', registry);
  let layerCount = struct.parseWithCursor(cursor, 'u8', registry);
  let sizeHeight = struct.parseWithCursor(cursor, 'u8', registry);
  let sizeWidth = struct.parseWithCursor(cursor, 'u8', registry);
  let soundEffect = struct.parseWithCursor(cursor, 'u8', registry);
  let layers = [];

  for (let i = 0; i < layerCount; i++) {
    layers.push(struct.parseWithCursor(cursor, layerSchema, registry));
  }

  let name = [];
  // Read rest of buffer into Symbol Art name
  let startPos = cursor.pos;
  for (let i = 0; i < (cursor.dataView.byteLength - startPos) / 2; i++) {
    try {
      let c = struct.parseWithCursor(cursor, 'u16le', registry);
      name.push(c);
    } catch (e) {
      break;
    }
  }

  let decoder = new TextDecoder('utf-16');
  let dataView = new DataView(Uint16Array.from(name).buffer);
  name = decoder.decode(dataView);

  return {
    authorId,
    layerCount,
    sizeHeight,
    sizeWidth,
    soundEffect,
    layers,
    name,
  };
};

export default schema;
