import express      from 'express'
import env          from './util/validate'
import db           from './config/db'
import index        from './routes/index'
import cookieParser from 'cookie-parser'
import cors         from 'cors'
import { errorValidation, 
         NotFoundEndpoint } from './middleware/error'
         
const app = express()

const PORT = env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(cors())


app.use('/v1/api', index)
app.use(NotFoundEndpoint)
app.use(errorValidation)


app.listen(PORT, () => {
    console.log(`Server running in on port  http://localhost:${PORT}`)
    db()
})