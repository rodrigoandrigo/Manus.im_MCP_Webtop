import { Router } from 'express';
import { handleMoveMouse, handleClickMouse, handleScrollMouse } from '../controllers/mouseController';

const router = Router();

router.post('/move', handleMoveMouse);
router.post('/click', handleClickMouse);
router.post('/scroll', handleScrollMouse);

export default router;

