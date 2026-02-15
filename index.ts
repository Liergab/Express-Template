import express      from 'express'
import { createServer } from 'http'
import env          from './util/validate'
import db, { disconnectDB } from './config/db'
import index        from './routes/index'
import cookieParser from 'cookie-parser'
import cors         from 'cors'
import helmet       from 'helmet'
import compression  from 'compression'
import rateLimit    from 'express-rate-limit'
import logger       from './config/logger'
import morganMiddleware from './middleware/morganMiddleware'
import { errorValidation,
         NotFoundEndpoint } from './middleware/error'
import { initSocketServer } from './socket/socketServer'

const app = express()
const httpServer = createServer(app)

const PORT = env.PORT

// HTTP request logger
app.use(morganMiddleware)

// Security middleware - Helmet (sets various HTTP headers)
app.use(helmet())

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Compression middleware for response optimization
app.use(compression())

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(cors())


app.use('/v1/api', index)
app.use(NotFoundEndpoint)
app.use(errorValidation)

const io = initSocketServer(httpServer)

httpServer.listen(PORT, () => {
    logger.info(`Server running on port http://localhost:${PORT}`)
    logger.info(`Socket.IO server ready on ws://localhost:${PORT}`)
    db()
})

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  io.close()

  httpServer.close(() => {
    logger.info('HTTP server closed')

    // Close Prisma database connection
    disconnectDB().then(() => {
      logger.info('Database connection closed')
      process.exit(0)
    }).catch((err: Error) => {
      logger.error('Error during database shutdown:', err)
      process.exit(1)
    })
  })

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))