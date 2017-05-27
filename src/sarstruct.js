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
    let unk1 = struct.parseWithCursor(cursor, 'u8', registry);
    let unk2 = struct.parseWithCursor(cursor, 'u8', registry);
    let someVal = struct.parseWithCursor(cursor, 'u16le', registry);

    let layerTexture = someVal >>> 5;
    let transparency = (someVal >> 2) & 0b111;

    let color = struct.parseWithCursor(cursor, 'u16le', registry);
    let unk3 = struct.parseWithCursor(cursor, 'u16le', registry);
    return {
      unk1,
      someVal,
      layerTexture,
      transparency,
      unk2,
      color,
      unk3,
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
  for (let i = 0; i < 13; i++) {
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
