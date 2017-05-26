import * as struct from '.';

describe('struct parser', () => {
  test('simple schema parses u8 buffer', () => {
    let schema = {
      val: 'u8',
    };
    let buf = Uint8Array.of(0x04);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val: 4});
  });

  test('simple schema parses u16be buffer', () => {
    let schema = {
      val: 'u16',
    };
    let buf = Uint8Array.of(0x00, 0x04);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val: 4});
  });

  test('simple schema parses u32be buffer', () => {
    let schema = {
      val: 'u32',
    };
    let buf = Uint8Array.of(0x00, 0x00, 0x00, 0x04);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val: 4});
  });

  test('simple schema parses two u8s', () => {
    let schema = {
      val1: 'u8',
      val2: 'u8',
    };
    let buf = Uint8Array.of(0x01, 0x02);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val1: 1, val2: 2});
  });

  test('simple schema parses two u16bes', () => {
    let schema = {
      val1: 'u16',
      val2: 'u16',
    };
    let buf = Uint8Array.of(0x00, 0x01, 0x00, 0x02);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val1: 1, val2: 2});
  });

  test('simple schema parses i8', () => {
    let schema = {
      val: 'i8',
    };
    let buf = Uint8Array.of(0xFF);
    let parsed = struct.parse(buf.buffer, schema);
    expect(parsed).toEqual({val: -1});
  });
});
