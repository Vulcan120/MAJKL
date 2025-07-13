// Utility function to convert station display names to JSON IDs
export function stationNameToId(stationName: string): string {
  return stationName
    .toLowerCase()
    .replace(/\s*&\s*/g, "-") // Replace " & " with hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/\(/g, "-") // Replace ( with hyphen
    .replace(/\)/g, "") // Remove )
    .replace(/'/g, "") // Remove apostrophes
    .replace(/\./g, "") // Remove periods
    .replace(/,/g, "") // Remove commas
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Utility function to convert JSON IDs back to display names
export function stationIdToName(stationId: string): string {
  return stationId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}
