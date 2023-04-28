import { unlink } from 'fs/promises';

export const formatDate = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export const removeFile = async (path: string): Promise<void> => {
  try {
    await unlink(path);
  } catch (e) {
    console.log('Error while removing file', e.message);
  }
};
