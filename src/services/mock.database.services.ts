import { config } from 'dotenv'
import { MongoClient } from 'mongodb'
config()

const mgclient = new MongoClient(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.6bzwl.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
)

const db = mgclient.db(process.env.DB_TEST_NAME as string)

// Create 1000 documents in 'users' collection
const users = db.collection(process.env.DB_USERS_TEST_COLLECTION as string)
const usersData = []
function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1
}

for (let i = 0; i < 1000; i++) {
  usersData.push({
    name: 'user' + (i + 1),
    age: getRandomNumber(),
    sex: i % 2 === 0 ? 'male' : 'female'
  })
}

users.insertMany(usersData)
