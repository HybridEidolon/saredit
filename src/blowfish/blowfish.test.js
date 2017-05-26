import BlowfishContext from '.';

describe('blowfish context', () => {
  test('create a proper p and s table', () => {
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new BlowfishContext(key.buffer);
    expect(b._p[0]).toEqual(3684606895);
    expect(b._p[1]).toEqual(403915684);

    expect(b._s[0][0]).toEqual(1437540708);
    expect(b._s[0][1]).toEqual(891499926);
  });

  test('parse a key', () => {
    const key = Uint8Array.of(0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00);
    const b = new BlowfishContext(key.buffer);
    expect(b._key[0]).toEqual(16777216);
    expect(b._key[1]).toEqual(16777216);
  });

  test('parse the pso2 sar key', () => {
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new BlowfishContext(key.buffer);
    expect(b._key[0]).toEqual(151503147);
  });

  test('decrypt a non-compressed sar', () => {
    let sar = Uint8Array.from([
      0x7D, 0xEA, 0x89, 0x57, 0xA2, 0x0D, 0x28, 0x38, 0x69, 0xB0, 0x48, 0xCB,
      0xC8, 0x4A, 0x2A, 0x45, 0x16, 0x5F, 0xFC, 0xA2, 0x45, 0x4E, 0x63, 0x71,
      0x4A, 0x44, 0xE2, 0xBA, 0x90, 0x74, 0x0C, 0x90, 0x4A, 0x44, 0xE2, 0xBA,
      0x90, 0x74, 0x0C, 0x90, 0x4A, 0x44, 0xE2, 0xBA, 0x90, 0x74, 0x0C, 0x90,
      0x41, 0x00,
    ]);
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new BlowfishContext(key.buffer);
    b.decrypt(sar.buffer);
    expect(sar).toEqual(Uint8Array.from(
      [35, 242, 156, 0, 1, 128, 193, 0, 112, 112, 112, 144, 144, 112, 144,
      144, 0, 0, 28, 30, 0, 120, 0, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65,
      0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0]
    ));
  });
});
