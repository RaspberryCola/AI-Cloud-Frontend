export const formatFileSize = (size: number): string => {
  if (size === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let convertedSize = size;
  while (convertedSize >= 1024 && index < units.length - 1) {
    convertedSize /= 1024;
    index++;
  }
  return `${convertedSize.toFixed(2)} ${units[index]}`;
};

export const downloadBlob = (blob: Blob, fileName: string, mimeType: string) => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}; 