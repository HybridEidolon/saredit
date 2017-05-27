import * as prs from './prs';

describe('prs decompressor', () => {
  test('decompress a simple prs correctly', () => {
    // input is: literal copy a byte, long copy EOF
    let input = Uint8Array.of(0x05, 0x69, 0x00, 0x00);
    let output = new Uint8Array(prs.decompress(input.buffer));
    expect(output).toEqual(Uint8Array.of(0x69));
  });

  test('decompress a nontrivial example prs', () => {
    let xor = [
      106, 182, 103, 9, 149, 148, 21, 84, 149, 244, 229, 106,
      5, 5, 105, 104, 149, 149, 137, 139, 149, 52, 237, 111,
      212, 101, 106, 154, 151, 149, 149,
    ].map(v => v ^ 0x95);

    let input = Uint8Array.from(xor);
    let output = new Uint8Array(prs.decompress(input.buffer));
    expect(output).toEqual(Uint8Array.from([
      35, 242, 156, 0, 1, 128, 193, 0, 112, 112, 112, 144,
      144, 112, 144, 144, 0, 0, 28, 30, 0, 120, 0, 0, 65, 0,
      65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0,
      65, 0, 65, 0, 65, 0, 65, 0,
    ]));
  });
});
