import express from 'express';
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { addServiceImage, removeServiceImage } from '../controllers/serviceController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { serviceSchema } from '../validators/serviceValidator.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:serviceId', getService);
router.post('/', authenticateUser, authorizeRoles('admin', 'staff', 'artist'), validateRequest(serviceSchema), createService);
router.put('/:serviceId', authenticateUser, authorizeRoles('admin', 'staff', 'artist'), validateRequest(serviceSchema), updateService);
router.delete('/:serviceId', authenticateUser, authorizeRoles('admin', 'staff'), deleteService);
router.post('/:serviceId/images', authenticateUser, authorizeRoles('admin', 'staff', 'artist'), addServiceImage);
router.delete('/:serviceId/images', authenticateUser, authorizeRoles('admin', 'staff', 'artist'), removeServiceImage);

export default router;
