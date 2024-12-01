import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

// connect to MongoDb Atlas by mongodb driver
databaseService.connect()

const app = express()

const port = 4000

app.use(express.json())
app.use('/users', usersRouter)

// Error handler for the whole app
// Everytime an error is thorwn, code will run into this error handler
app.use((defaultErrorHandler))
// console.log(typeof defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
