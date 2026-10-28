const { v2: cloudinary } = require('cloudinary');
const config = require('./config');
const { HttpError } = require('./utils/errors');

const { cloudName, apiKey, apiSecret } = config.cloudinary;
const configured = Boolean(cloudName && apiKey && apiSecret);

if (configured) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
} else {
  console.warn('אזהרה: Cloudinary לא מוגדר ב-.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). העלאת תמונות לא תעבוד.');
}

function ensureConfigured() {
  if (!configured) throw new HttpError(503, 'Image storage (Cloudinary) is not configured on the server');
}

// מעלה תמונה מהזיכרון. מחזירה את התוצאה של Cloudinary (secure_url, public_id)
function uploadImage(buffer, publicId) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', overwrite: true, invalidate: true },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  }).catch((err) => {
    console.error('Cloudinary upload failed:', err);
    throw new HttpError(502, 'Image upload failed');
  });
}

// מוחקת תמונה. כשל במחיקה לא מפיל בקשה, רק נרשם בלוג
async function deleteImage(publicId) {
  if (!configured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.error('Cloudinary delete failed:', publicId, err);
  }
}

module.exports = { uploadImage, deleteImage };
