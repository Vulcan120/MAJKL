// scale-tube-map.js
// Usage: node scale-tube-map.js

import fs from "fs/promises";
import axios from "axios";

async function main() {
  // 1. Load your base data
  const base = JSON.parse(await fs.readFile("london.json", "utf-8"));

  // 2. Fetch Tube station list from TfL
  const { data: stationsList } = await axios.get(
    "https://api.tfl.gov.uk/Line/Mode/tube/Station"
  );

  // Build a map: stationKey → { lat, lon, commonName }
  const stationByKey = {};
  for (const s of stationsList) {
    // use stationNaptanCode if your 'london.json' keys match that,
    // otherwise match on commonName lowercased with dashes
    const key = s.commonName
      .toLowerCase()
      .replace(/[\s’'&\.]/g, "-")
      .replace(/-+/g, "-");
    stationByKey[key] = {
      lat: s.lat,
      lon: s.lon,
      name: s.commonName,
    };
  }

  // 3. Compute bounding box
  const lats = Object.values(stationByKey).map((s) => s.lat);
  const lons = Object.values(stationByKey).map((s) => s.lon);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats),
    minLon = Math.min(...lons),
    maxLon = Math.max(...lons);

  // scale helper
  function scale(val, minV, maxV) {
    return Math.round(((val - minV) / (maxV - minV)) * 100);
  }

  // 4. Inject coords
  for (const [key, st] of Object.entries(base.stations)) {
    const ref = stationByKey[key];
    if (!ref) {
      console.warn(`⚠️  No TfL match for "${key}" (${st.label})`);
      continue;
    }
    st.coords = [
      scale(ref.lat, minLat, maxLat),
      scale(ref.lon, minLon, maxLon),
    ];
  }

  // 5. Write out
  await fs.writeFile(
    "london_scaled.json",
    JSON.stringify(base, null, 2),
    "utf-8"
  );
  console.log("✅ Generated london_scaled.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
