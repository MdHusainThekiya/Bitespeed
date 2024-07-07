import express from 'express';
import contactController from '../controllers/contactController';

const router = express.Router();

router.post( '/identify', contactController.identify );


export default router;