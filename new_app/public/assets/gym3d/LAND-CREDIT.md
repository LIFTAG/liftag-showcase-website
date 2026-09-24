# Europe land mask

`europe-land.png` is a 2000 × 1140 8-bit greyscale raster, 0.05° per pixel,
covering 30°W–70°E and 25°N–82°N. Values: 0 sea, 128 land, 255 Slovakia.
`utils/gymscan/orbitMap.ts` (`ORBIT_MASK`) holds the same extent.

Rasterised from Natural Earth 1:50m data, which is in the public domain:

- Land: `ne_50m_land`
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson
- Slovakia: `ne_50m_admin_0_countries`
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

Each pixel centre is filled by an even-odd scanline test against the polygon
rings, land first, then Slovakia over it. The chapter only samples it on the
CPU to decide where to place dots; it is never drawn.
