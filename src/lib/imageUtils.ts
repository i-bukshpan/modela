export async function processImageFile(file: File): Promise<File> {
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    try {
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      const newName = file.name.replace(/\.heic$/i, '.jpeg');
      return new File([blob], newName, { type: 'image/jpeg' });
    } catch (err) {
      console.error('Error converting HEIC image:', err);
      // Fallback: return original file, though it might not display
      return file;
    }
  }
  return file;
}

export async function processImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(processImageFile));
}
