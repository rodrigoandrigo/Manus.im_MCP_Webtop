import { Router } from "express";
import { initializeWebtop, shutdownWebtop } from "../controllers/webtopController";
import mouseRoutes from "./mouseRoutes";
import keyboardRoutes from "./keyboardRoutes"; // Importado
import screenRoutes from "./screenRoutes"; // Importado

const router = Router();

// Webtop routes
router.post("/webtop/initialize", initializeWebtop);
router.post("/webtop/shutdown", shutdownWebtop);

// Mouse routes
router.use("/mouse", mouseRoutes);

// Keyboard routes
router.use("/keyboard", keyboardRoutes); // Rotas de teclado conectadas

// Screen routes
router.use("/screen", screenRoutes); // Rotas de tela conectadas

export default router;

