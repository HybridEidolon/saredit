// Struct parsing

/**
 * 
 * @param {ArrayBuffer} buffer buffer to parse
 * @param {Object} schema schema to parse with
 * @param {Object} registry registry of schemas to reference for subschemas
 * @returns {Object} parsed struct
 */
export function parse(buffer, schema, registry = {}) {
  let dv = new DataView(buffer);
  let res = {};
  let pos = 0;

  for (let k of Object.keys(schema)) {
    let v = schema[k];
    switch (v) {
      case 'u8': {
        res[k] = dv.getUint8(pos);
        pos += 1;
      } break;
      case 'u16': {
        res[k] = dv.getUint16(pos, false);
        pos += 2;
      } break;
      case 'u32': {
        res[k] = dv.getUint32(pos, false);
        pos += 4;
      } break;
      case 'i8': {
        res[k] = dv.getInt8(pos);
        pos += 1;
      } break;
      case 'i16': {
        res[k] = dv.getInt16(pos, false);
        pos += 2;
      } break;
      case 'i32': {
        res[k] = dv.getInt32(pos, false);
        pos += 4;
      } break;
    }
  }

  return res;
}
