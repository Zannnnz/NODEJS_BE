import express from 'express';
import userRoutes from './user.router.js';
import videoRoutes from './video.router.js';
import authRouter from './auth.router.js';
const rootRoutes = express.Router();

rootRoutes.use("/users",userRoutes);
rootRoutes.use("/video",videoRoutes);
rootRoutes.use("/auth",authRouter);

export default rootRoutes;