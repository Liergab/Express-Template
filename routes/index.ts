import express from 'express'
import userRouter from './userRoutes'
import healthRouter from './healthRoutes'
const router = express.Router()

router.use(healthRouter)
router.use(userRouter)

export default router