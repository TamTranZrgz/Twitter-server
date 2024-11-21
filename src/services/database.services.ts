import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema.js'

config()

// console.log(process.env.DB_USERNAME)
// console.log(process.env.DB_PASSWORD)
// console.log(process.env.DB_NAME)

// Use mongodb driver to connect to Mongo Atlas
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.6bzwl.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)

    // syntax to retrieve a database instance
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      // Ensures that the client will close when you finish/error
      // await this.client.close()
      console.log('Error', error)
      throw error
    }
  }

  // create a getter function to get users collection
  get users(): Collection<User> {
    // console.log(process.env.DB_USERS_COLLECTION)
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}

// create a new object from DatabaseService class
const databaseService = new DatabaseService()

export default databaseService
