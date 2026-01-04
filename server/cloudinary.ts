import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djo2yf7lt',
  api_key: process.env.CLOUDINARY_API_KEY || '355462186114191',
  api_secret: process.env.CLOUDINARY_API_SECRET || '2jWArq2fAxLv2nPMqtk9Huwlk08'
});

export { cloudinary };
export default cloudinary;
