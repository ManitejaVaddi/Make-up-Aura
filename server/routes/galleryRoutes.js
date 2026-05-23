import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadGalleryMedia, getGallery, deleteGalleryItem } from '../controllers/galleryController.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', authenticateUser, authorizeRoles('admin', 'staff'), uploadGalleryMedia);
router.delete('/:galleryId', authenticateUser, authorizeRoles('admin', 'staff'), deleteGalleryItem);

export default router;
