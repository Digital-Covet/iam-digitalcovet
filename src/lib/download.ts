export function downloadTextFile(
  content: string,
  mimeType: string,
  filename: string,
) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  }).click();
  URL.revokeObjectURL(url);
}
