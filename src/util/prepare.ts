import type { CompiledQuery } from '../query-compiler/compiled-query'

const hl: string[] = []
for (let i = 0; i < 256; i++) {
  hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16)
}

//_hash32_1a_fast_hex_utf
function hashString(str: string) {
  let c,
    i,
    l = str.length,
    t0 = 0,
    v0 = 0x9dc5,
    t1 = 0,
    v1 = 0x811c

  for (i = 0; i < l; i++) {
    c = str.charCodeAt(i)
    if (c < 128) {
      v0 ^= c
    } else if (c < 2048) {
      v0 ^= (c >> 6) | 192
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    } else if (
      (c & 64512) == 55296 &&
      i + 1 < l &&
      (str.charCodeAt(i + 1) & 64512) == 56320
    ) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023)
      v0 ^= (c >> 18) | 240
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 12) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 6) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    } else {
      v0 ^= (c >> 12) | 224
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 6) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    }
    t0 = v0 * 403
    t1 = v1 * 403
    t1 += v0 << 8
    v1 = (t1 + (t0 >>> 16)) & 65535
    v0 = t0 & 65535
  }

  return (
    hl[(v1 >>> 8) & 255] + hl[v1 & 255] + hl[(v0 >>> 8) & 255] + hl[v0 & 255]
  )
}

export function createPrepare(
  compiledQuery: CompiledQuery<any>,
  args?: { prepare?: boolean },
) {
  return args?.prepare
    ? {
        name: hashString(compiledQuery.sql),
        text: compiledQuery.sql,
        values: compiledQuery.parameters as any,
      }
    : undefined
}
