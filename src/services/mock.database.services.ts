import { config } from 'dotenv'
import { MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'

const mgclient = new MongoClient(
  `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@twitter.6bzwl.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
)

const db = mgclient.db(envConfig.dbTestName as string)

// Create 1000 documents in 'users' collection
const users = db.collection(envConfig.dbUsersTestCollection as string)
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
