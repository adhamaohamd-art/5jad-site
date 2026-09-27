// ============================================================
// رفع الملفات على Cloudinary (بديل Firebase Storage)
// سجّل حساب مجاني على cloudinary.com وحط بياناتك هنا:
// Settings → Upload → Add upload preset → Signing Mode: Unsigned
// ============================================================
const CLOUD_NAME = 'erhb05ur';
const UPLOAD_PRESET = 'luj0joez';

export type UploadType = 'image' | 'document' | 'general';

const UPLOAD_RULES: Record<UploadType, { allowedMime: string[]; maxSize: number; folder: string }> = {
  image: { allowedMime: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 5 * 1024 * 1024, folder: 'images' },
  document: { allowedMime: ['application/pdf', 'image/jpeg', 'image/png'], maxSize: 20 * 1024 * 1024, folder: 'documents' },
  general: { allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], maxSize: 20 * 1024 * 1024, folder: 'general' },
};

export function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
  uploadType: UploadType = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const rule = UPLOAD_RULES[uploadType];

    if (!rule.allowedMime.includes(file.type)) {
      return reject(new Error('نوع الملف غير مسموح.'));
    }
    if (file.size > rule.maxSize) {
      return reject(new Error(`حجم الملف كبير جدًا. الحد الأقصى ${(rule.maxSize / 1024 / 1024).toFixed(1)} ميجا.`));
    }

    const safeName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const publicId = `${rule.folder}/${Date.now()}_${safeName}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('public_id', publicId);
    formData.append('folder', rule.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, true);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url, publicId: data.public_id });
        } catch {
          reject(new Error('رد غير متوقع من Cloudinary.'));
        }
      } else {
        reject(new Error(`فشل رفع الملف (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error('مشكلة في الاتصال بالإنترنت.'));
    xhr.send(formData);
  });
}
