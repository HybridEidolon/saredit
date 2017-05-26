// Struct parsing

import Cursor from '../cursor';

const baseRegistry = {
  'u8': cursor => cursor.readUint8(),
  'u16': cursor => cursor.readUint16(false),
  'u32': cursor => cursor.readUint32(false),
  'u16le': cursor => cursor.readUint16(true),
  'u32le': cursor => cursor.readUint32(true),
  'i8': cursor => cursor.readInt8(),
  'i16': cursor => cursor.readInt16(false),
  'i32': cursor => cursor.readInt32(false),
  'i16le': cursor => cursor.readInt16(true),
  'i32le': cursor => cursor.readInt32(true),
  'f32': cursor => cursor.readFloat32(false),
  'f64': cursor => cursor.readFloat64(false),
  'f32le': cursor => cursor.readFloat32(true),
  'f64le': cursor => cursor.readFloat64(true),
};

/**
 * 
 * @param {ArrayBuffer} buffer buffer to parse
 * @param {Object} schema schema to parse with
 * @param {Object[]} registries registries of schemas or parsers to use (including base registry)
 * @returns {Object} parsed struct
 */
export function parse(buffer, schema, registries = []) {
  let cursor = new Cursor(buffer);
  let registry = [baseRegistry].concat(registries).reduce((a, v) => Object.assign(a, v), {});

  return parseWithCursor(cursor, schema, registry);
}

export function parseWithCursor(cursor, schema, registry) {
  switch (typeof schema) {
    case 'string': {
      // References a schema/parser in the registry
      return parseWithCursor(cursor, registry[schema], registry);
    }
    case 'function': {
      // Cursor parse function
      return schema(cursor, registry);
    }
    case 'object': {
      // Schema object; recurse for each key
      let ret = {};
      for (let k of Object.keys(schema)) {
        let v = schema[k];
        let value = parseWithCursor(cursor, v, registry);
        ret[k] = value;
      }
      return ret;
    }
  }
}
