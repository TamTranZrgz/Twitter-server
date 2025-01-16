# Workflow

## 91 + 92. Access_token & refresh_token middleware for Logout

- Use `POST` method, because user needs to send `refresh_token` in `request body`, in order to delete that `refresh_token` in db
- Use `access_token`: only that user can logout
- Hence middleware will validate `access_token`: whether is included in `request header`, and verify if it's in correct form or expired ?. After that, return `decoded_authorization` (payload: which includes user_id).
- Middleware to validate `refresh_token`: correct form, expired ?, and is in database ? And save `decode_refresh_token` in `request`
- Delete `refresh_token` in database
- Return message `Logout Success`

<quote>
  header: 
    Authorization: Bearer + access_token
  body: { refresh_token }
<quote>

## 95. Verify email

- workflow

## 96. Update time with $currentDate and $$NOW

- (1) When we use `new Date()`, is the time the we create a time, and insert it into db
- (2) After some miliseconds, the data will be saved into db, this time will be the time MongoDb really update it's data.
- We can use both time for `created_at`
- Use `$currenDate` or `$$NOW` for second case.

```ts
databaseService.users.updateOne(
  {
    _id: new ObjectId(user_id)
  },
  {
    // update email_verify_token
    $set: {
      email_verify_token: '',
      verify: UserVerifyStatus.Verified
      // updated_at: new Date()
    },
    $currentDate: {
      updated_at: true
    }
  }
)
```

- Or we can use `$$NOW` for MongoDb to update it's data

```ts
databaseService.users.updateOne(
  {
    _id: new ObjectId(user_id)
  },
  [
    {
      // update email_verify_token
      $set: {
        email_verify_token: '',
        verify: UserVerifyStatus.Verified,
        updated_at: '$$NOW'
      }
    }
  ]
)
```

## 97. Resend verified email

- This happens when user clicks on button to ask for resending another verified email
- We will use a new email_verify_token (in case the old one is expired), and update that new token into the db Users
- Use method `POST` with `access_token` in `header`

## 98 -> 100. Forgot password

## 101. Get me (my profile)

## 102. MongoDb Schema Validation

- Before this step, we only validate data at middleware stage
- In this step, we will validate at database stage (mongoDb). It will aslo validate databse at MongoSH

## 103. Code Logic VerifiedUserValidator

- After verifying profile, we can update our profile
- For update: use `PUT` or `PATCH`
- `PUT`: send the whole form
- `PATCH`: only send the updated field

## 104. Use filterMiddleware to filter data of body

- Ex: send forgor_password_token with invalid type is still added to db
- Create a filter Middleware to filter only wanted keys for body req before arriving to server
- Solution: use `pick` function (from `lodash`) to choose only `keys` that we have defined

## 107. Get user profile

- In this function, we need to access to see some info of a person
- Use api: /users/:username
- On Client side will display-> https://twitter.com/username

## 108. Follow user

- when we follow someone, there will a document added into `followers` collections

```ts
interface Follower {
  _id: ObjectId
  user_id: ObjectId // my user_id
  followed_user_id: ObjectId // id of person we fave followed
  created_at: Date
}
```

## 110. Fix bug unique username

## 111. Change password

## 113. Google Auth Register

- use react client to test this function

## 116 - 135. Media

- Choose between Formidable/Multer
- Formidable is used for most frameworks of Nodejs (ExpressJs, fastify), while Multer is only used for ExpressJs
- Create new Router for media files
- Create a temp directory to save uploaded files (index.ts file)
- As `Formidable` allows us to upload different types of file, we need to use option `filter` to retrieve only `image` file
- Optimize file size with `sharp` (size, quality, exif & metadata, etc.). [Sharp](https://sharp.pixelplumbing.com/). In this project, I will convert those pics into `jpeg` type
- Note 1: put `uploads` folder in .gitignore
- Note 2: if we keep `uploads` folder in local repo, we cant shsare files with other team members. Solution will be upload files into another platform provider such as S3, or our server.
- To differentiate the running environment (test/production/development) in establishing path (ex: display photos on link). Use `minimist` package: to parse argument options in commands (Ex: script in package.json)
- Serving static files: for example images, css files, js files, etc. => use `express.static` built-in middleware function in Express. Another solution is using router which will allow us to customize acording to our preference
- Upload multiple images can be also used for uploading a single image. So we can renunite upload a single image and multiple images.
- Upload video is the same as upload image. However, can lead to error `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`. We can use buil-in `express.static` middleware to solve this problem, by streaming videos.
- Streaming video: will not load the whole content of video at once, but step by step. We cal also customize `streaming` function acording to our demand.
- Another way to work with video is `HLS Streaming`.

## 136 - 147. Optimizing MongoDb efficiency

- `index`: use 1 index to optimize efficiency of MongoDb. `_id` index is default in MongoDb
- `compound index`: use multiple indexes (choose more than 1 index at the same time)
- `index` asc (ex: name*1) and des (ex: age*-1)

Ex: this query will display documents in order of age (asc) (`index` age with `asc` and name with `asc`)

```sql
{ age: {$lt: 50}, sex: 'male' }
```

Using `sort` function will cost more time (esp when data is large) than using index (asc)

- When we use `compound index`, we shoudl also use separated `index` if query only uses one `index`
- Use `text index`:

Exam: in `address` field of `extra_users` collection, add "Da nang, Viet Nam". And search for document that have this text. Before doing this, we will need to index the `address` field as `text`. Use function `search index` in MongoDb will let mongoDb search inside `address` field

```sql
{$text: {$search: "Viet Nam"}}
```

Note: `text index` does not allow `index` one field if it has been alreeady indexed. So you need to index all fields at once. For ex, index `address` and `name` at once, will let the query search text in both fields.

- work with `ìndex` by MonDb Shell

```sql
use test
db.users.getIndexes()
db.users.createIndex({name: -1})
db.users.dropIndex('name_-1')
```

Note: we can not modify `index`, we can only delete it, and create new one

- Advanatges of `index`: increate time of retrieving data, therefore decrease time to return result. Disavantages: will increase occupancy of memory (dung luong luu tru) by creating an index table.

Note: 1 collection only has maximum 64 index. 1 collection only has 1 index text. If you want more than 1 `index text`, use `compound`

- Optimize `index` when initiate server: normally, everytime we initialize the server, the `index` process will repeat again. It will affect performance, but not logic. So we will modify code to assure that `index` process will not be repeated again, by using `async` and check if `index` has been existed in db

## 148 - 159. Tweet functions

- Create `Tweet` schema -> Tweet will have following properties and functions: containing text, hashtags, mentions, images, videos; can be displayed for everyone or only Tweet circle; difining who can cmt (everyone, who we are following, or who we are mentioning); will have nested tweet (tweet which contain children).

```ts
// schema
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  null when it's the orginal
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
```

- Validate TweetBody (from req.body) by using `validate` function to wrap `checkSchema` (from `express-validator` lib) to check some main properties. This validation is conducted in `tweets.middlewares`

We will choose to validate some main properties:

1. `type` must be one of 4 types of tweet (tweet, retweet, comment, quote tweet)
2. `audience` must be `everyone` or `circle tweet`
3. `content` will be empty if is it `retweet`, and must be string if it belongs to other types
4. `parent_id` must be `_id` of `parent tweet` (if tweet type is among retweet, comment or quotetweet), or will be `null` if type is tweet
5. `hashtags`, `mentions`, `medias` must be arrays

```ts
// client sends data in request body
interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  null when it's the orginal, or tweet_id as string
  hashtags: string[] // client sends hashtag in req as string
  mentions: string[] // string has type of user_id
  medias: Media[]
}
```

- Create tweet in `tweets.controllers` and `tweets.services`
  Note: after `insertOne` a new tweet to database, it will not return a tweet, but only an object to indicate that a new tweet has been created. To get a tweet as a return, we need to add one more step, `findOne` the tweet in database

```ts
{
  acknowledged: true,
  insertedId: new ObjectId("64adffdsfdsfsdfsfsdfdsf")
}
```

- Tweet schema validation in MongoDb

```ts
{
  $jsonSchema: {
    bsonType: 'object',
    title: 'tweets object validation',
    required: [
      '_id',
      'user_id',
      'type',
      'audience',
      'content',
      'parent_id',
      'hashtags',
      'mentions',
      'medias',
      'guest_views',
      'user_views',
      'created_at',
      'updated_at'
    ],
    properties: {
      _id: {
        bsonType: 'objectId',
        description: '\'_id\' must be an ObjectId and is required'
      },
      user_id: {
        bsonType: 'objectId',
        description: '\'user_id\' must be an ObjectId and is required'
      },
      type: {
        bsonType: 'int',
        'enum': [
          0,
          1,
          2,
          3
        ],
        description: '\'type\' must be a TweetType and is required'
      },
      audience: {
        bsonType: 'int',
        'enum': [
          0,
          1
        ],
        description: '\'audience\' must be a TweetAudience and is required'
      },
      content: {
        bsonType: 'string',
        description: '\'content\' must be a string and is required'
      },
      parent_id: {
        bsonType: [
          'null',
          'objectId'
        ],
        description: '\'parent_id\' must be a null or ObjectId and is required'
      },
      hashtags: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'objectId'
        },
        description: '\'hashtags\' must be an array and is required'
      },
      mentions: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'objectId'
        },
        description: '\'mentions\' must be an array and is required'
      },
      medias: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'object',
          required: [
            'url',
            'type'
          ],
          additionalProperties: false,
          properties: {
            type: {
              'enum': [
                0,
                1,
                2
              ],
              description: '\'type\' is required and can only be one of the given enum values'
            },
            url: {
              bsonType: 'string',
              description: '\'url\' is a required field of type string'
            }
          }
        },
        description: '\'medias\' must be an array and is required'
      },
      guest_views: {
        bsonType: 'int',
        minimum: 0,
        description: '\'guest_views\' must be a number and is required'
      },
      user_views: {
        bsonType: 'int',
        minimum: 0,
        description: '\'user_views\' must be a number and is required'
      },
      created_at: {
        bsonType: 'date',
        description: '\'created_at\' must be a date and is required'
      },
      updated_at: {
        bsonType: 'date',
        description: '\'updated_at\' must be a date and is required'
      }
    },
    additionalProperties: false
  }
}
```

- Create `hashtags`. When we create a new tweet, we might include some hashtags. We will check whether this hashtag has been added to database, if has been created, we retrieve it, if not, a new hashtag will be created.

- `Bookmark` and `unbookmark` a tweet
- `Like` and `unlike` a tweet
- Validate `tweet_id` before `like`/`unlike` or `bookmark`/`unbookmark`
- create route `/tweets/:tweet_id` to get tweet detail.

## 160 - 165. Aggregation Pipelines in MongoDb

### 1. Aggregation Pipelines

- aggregation Pipelines can have more than 1 stages and are in orders. Each stage act upon the results of the previous stage.

- Ex: in `tweets` collection, we have `hashtags` field as an array of `ObjectId` of different hashtags. Now we want to map this `hashtags` field with the real `hashtags` collection to get more info about those hashtags (such as name).

-- match: filter the documents from tweet collection

```shell
{
  _id: ObjectId('675745664af89cbda57b0e8c')
}
```

Here We will have a tweet document with `hashtags` field as only an array of `ObjectId`

-- lookup: perform a join between 2 collections

```shell
 * from: The target collection.
 * localField: The local join field.
 * foreignField: The target join field.
 * as: The name for the results.
 * pipeline: Optional pipeline to run on the foreign collection.
 * let: Optional variables to use in the pipeline field stages.
 */
{
  from: "hashtags",
  localField: "hashtags",
  foreignField: "_id",
  as: "results" // can be named as "hashtags"
}
```

-- $project : add new field(s) to a document with computed value, or reassign field(s) from a document with computed value => Display or no display field(s) in document in a stage of a pipeline

Note: value `0` to exclude a field from document, but `1` to display only that field from document

--- Ex1: exclude `mentions` field from a `tweet` document

```ts
/**
 * specifications: The fields to
 *   include or exclude.
 */
{
  mentions: 0
}
```

--- Ex2: include only `mentions` and `hashtags` fields from a `tweet` document

```shell
/**
 * specifications: The fields to
 *   include or exclude.
 */
{
  mentions: 1,
  hashtags: 1
}
```

However, in this stage, all data of `users` in `mentions` field will be displayed including `password`.

### 2. Aggregation Pipelines Operators

- is operation in each stage

Ex1: continue with above example, here we will choose which fields in `mentions` field to display. In this case, we will use `$addFields` (not `$project`) to add a new `mentions` field which will overwrite the old `mentions`

-- $map: like `map()` in Javascript -> return a new array with resolved items

```shell
/**
 * Use '$addFields' to add new field
 * And use '$map' to get only projected items
 * specifications: The fields to
 *   include or exclude.
 */
{
  mentions: {
    $map: {
      input: "$mentions",
      as: "mention",
      in: {
        _id: "$$mention._id",
        name: "$$mention.name",
        username: "$$mention.username",
        email: "$$mention.email"
      }
    }
  }
}
```

Ex2: We want to count how many bookmarks for a tweet. But `bookmarks` is not a field in `tweets`, but a collection. To count the number of bookmark, we ned to connect `bookmarks` and `tweets` collections.

```shell
/**
 * Count number of bookmark
 * Use '$addFields' and '$size'
 * newField: The new field name.
 * expression: The new field expression.
 */
{
  bookmart_count: {
    $size: "$bookmarks"
  }
}
```

Ex3: In Twitter database, `tweets` collection includes all types of tweet (parent tweet, retweet, quote, comment); `bookmarks` is a saperated collection from `tweets` collection. Now we want to retrieve all `children_tweets` (which will have the `parent_id` equal to the `_id` of tweet itself). First use `$lookup` to get `children_tweets`:

```shell
{
  from: "tweets",
  localField: "_id",
  foreignField: "parent_id",
  as: "children_tweets"
}
```

Now we can use `$filter` & `$equal` to count the quantity of each type of tweet:

```shell
{
  bookmart_count: {
    $size: "$bookmarks"
  },
  like_count: {
    $size: "$likes"
  },
  children_tweet_count: {
    $size: "$children_tweets"
  },
  retweets_count: {
    $size: {
      $filter: {
      	input: "$children_tweets",
        as: "item",
        cond: {
          $eq: ["$$item.type", 1]
        }
      }
    }
  },
  comments_count: {
    $size: {
      $filter: {
        input: "$children_tweets",
        as: "item",
        cond: {
          $eq: ["$$item.type", 2]
        }
      }
    }
  },
  requote_count: {
    $size: {
      $filter: {
        input: "$children_tweets",
        as: "item",
        cond: {
          $eq: ["$$item.type", 3]
        }
      }
    }
  }
}
```

And we can use `$add` to calculate total views of a tweet

```shell
views: {
    $add: ["$user_views", "$guest_views"]
  }
```

### 3. Apply aggregation in nodejs to `tweets`

- First, export file from Mongo Compas
- Attach this syntax inside `validateTweetId` to retrieve all info needed for tweet (aggregation), and attached that tweet to the `req` body for later use.

## 166-174. Work with tweet views, comments, retweet, quotes and pagination; and more

### 1. Increase view for tweet: get tweet from db (use `validateTweetId` middleware), increase views (use `increaseView` from tweet services, and mutate the result to get view updated in `getTweetController` -> use `findOneAndUpdate`)

### 2. Get tweet children (comments, retweet, quotes) with pagination

- This app will display tweet comments with `infinite scroll` which will display a certain tweets at one time and appear others when user scrolls on the screen.

### 3. Increase view for children tweet

- in `getTweetChildren` service, add `updateMany` syntax to update views for children tweet (including user_views and guest_views).

### 4. Add getTweetChildrenValidator

- in `tweets.middleware`, add validator before getting tweet children, validate factors attached in url query such as `limit`, `page` and `tweet_type`. While `limit` and `page` must be number, `tweet_type` must be in the range of `TweetType`.

### 5. Fake data automatically with `Faker` library

- create fake data used for testing and development - > use `faker-js` library
- create `fake.ts` file in `utils` folder

### 6. Work with feeds

- use `aggregation` in Mongo Compass to get the process to retrieve all new feeds for a user
- get all user_id of uers that I have been following
- get all tweets (new feeds) of users that I have been following
- paginate those feeds and update their views (user_views) when it is seen by users (in this case by me)

## 17. Advanced Search in Twitter

### 17.1. Analyze basic search functions in twitter

- analyze search term: use `encodeURIComponent` to encode `empty space` search term

```ts
const a = 'btc scammed'
encodeURIComponent(a) // 'btc%20scammed'
decodeURIComponent('btc%20scammed') // 'btc scammed'
```

- twitter will filter `search term` in different areas: tweets, uername, people, and tweets that have images or videos, or results accroding to date, etc.

- search tweets on MongoDb, we should `index` fields that we will base on, for example, this app will index `content` field

- In this app, we only host database on MongoDb Atlas, but we will use `Text Search on Self-Managed Deployments` for further posibilities (whether database is hosted on Mongo Atlas or VPS) [Text Search](https://www.mongodb.com/docs/manual/text-search/) or [More_details_on_text_search_of_self_managed_deployments](https://www.mongodb.com/docs/manual/core/link-text-indexes/#std-label-text-search-on-premises)

### 17.2. Design search route, pagination with aggregation

- use `aggregation` in MongoDb Compass to get feeds.
- for pagination: need 3 variables (limit, page, total_page)

### 17.3. Fix bug of not finding some search term

- Reason: in MongoDb, 'stop words' (ex: who) are words that are considered as not having meaning, so will be ignored when searching
- Solution: create index for tweet's content with `indexTweets` function in `database.services.ts`. Delete `content` index in MongoDb database

### 17.4. Implement `encodeURIComponent` in postman

- Note: on URL, it's not good to leave blank space "\_"
- add this function in pre-request script in postman for `search` api

```shell
// console.log(pm.request.url.query)
// console.log(pm.request.url.query.get("content"))
const content = pm.request.url.query.get('content')
pm.request.url.query.remove('content')
pm.request.url.query.add(`content=${encodeURIComponent(content)}`)
console.log(pm.request.url.query)
```

### 17.5. Filter tweets which have images or video

- add `media_type` parameter to `SearchQuery` and `searchController`

### 17.6. Search tweets from a user who we have followed or cualquier person

- Note: all params passed to URL will be string , whether boolean `true` or `false` or number `0` or `1`
- ad `people_follow` to `SearchQuery`
- add `people_follow` parameter to `SearchController`
- add `accessTokenValidator` and `verifiedUserValidator` to get `user_id`
- `people_follow` is optional, controller only processes when `people_follow` is true

### 17.7. Search term validator

## 18. AWS

We will use 2 products:

- simple email: send email (ses)
- s3: file repo

### 18.1. Price and Account Register

### 18.2. AWS SES

- AWS: cloud services of Amazon
- Amazon SES: send email (limit 50k in one day)

- Amazon SES (simple Email Service) is designed for server to send a bulk of email, it's different from Gmail which is free for personal use. Gmail is not designed to send email as a big quantity (limit of 500 emails and receive within 24 hours)
- To work with AWS SES, we need to know programming, and create server by ourselve to send email with Amazon SES

- We will use `thanh.tam.tran.zrgz@gmail.com` email to send email with `Amazon SES` as server -> choose `create identity` and choose `Email address` as your identity type. Add at least 2 emails to `Identities` part.

- Configure IAM (identity and Access Management) service to manage accounts, authorization to AWS services

### 18.3. Test Sending email

- add aws_asscess_key and aws_secret_key to `.env` file

```ts
AWS_ACCESS_KEY_ID = 'AKIA4IM3HJ5SGxxxxxx'
AWS_SECRET_ACCESS_KEY = 'jSinRHtCt1O7za1xxxxxxxxxxxx'
AWS_REGION = 'eu-west-3'
SES_FROM_ADDRESS = 'thanh.tam.tran.zrgz@gmail.com'
```

- install package

```bash
npm i @aws-sdk/client-ses
```

- create file `send-email.js`

```js
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses')
const { config } = require('dotenv')

config()

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = async (toAddress, subject, body) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject
  })

  try {
    return await sesClient.send(sendEmailCommand)
  } catch (e) {
    console.error('Failed to send email.')
    return e
  }
}

sendVerifyEmail('tamtran2885@gmail.com', 'Tiêu đề email', '<h1>Nội dung email duoc gui tu tam tran ngay 5 thang 1</h1>')
```

- send email by command `node`

```bash
node send-email.js
```

### 18.4. Send email after registering

- create `email.ts` file in `utils` folder, copy content of `send-email.js` to `email.ts`, and modify it.

- in function `register` of `users.services`, add function `sendVerifyEmail` after fisnishing register

```ts
console.log('email_verify_token', email_verify_token)

// Flow verify email:
// 1. Server send email to user
// 2. User click link in email to verify email
// 3. Client send request to server with emai_verify_token
// 4. Server verify email_verify_token
// 5. Client receive access_token and refresh_token

await sendVerifyEmail(
  payload.email,
  'Verify your email',
  `
      <h1>Verify your email:</h1>
      <p>Click <a href="${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}">here</a> to verify your email</p>
    `
)
```

### 18.5. Send email with a template `html`

- create a `verify-email.html` in `templates` folder
- create `email.ts` in `utils` (copy from `send-email.js` file) , use `fs.readFileSync` to read file template, add `sendVerifyRegisterEmail` and `sendForgotPasswordEmail` functions.

- add these two functions to `resendVerifyEmail` and `forgotPassword` in `users.services`

### 18.6. Code `Verify Email` and `Reset Password` page

### 18.7. Create and connect to S3

- service to store files, images, videos... You can even deploy React ; Vuel, Angular, etc.

- click `Create Bucket`, add `name` and create bucket

- use nodejs to connect to this bucket: [Nodejs-s3-bucket](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-node-examples.html)

- install package

```bash
npm i @aws-sdk/client-s3
```

- create `s3` file in `utils` folder, add it to `index` file
  Note: remember to add permisson `AmazonS3FullAccess` to access to S3 on Amazon account panel

### 18.8. Upload file to S3

- add package

```bash
npm i @aws-sdk/lib-storage
```

- add more code to `s3` to upload file to S3 on AWS

- reference: [Set-permisson-for-website-access-s3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html)

- prevent from dowloading image when clicking on image link on S3:

```ts
ContentType: 'image/jpeg'
```

### 18.9. Upload image and video through route

## 19. Websocket

- websocket: giao thuc giao tiep 2 chieu giua trinh duyet va may chu theo thoi gian thuc. Vd: tin nhan tro chuyen, tro choi ban sung dien tu, thong tin thi truong chung khoan (hien thi gia thay doi) , etc. ma khong can goi api

- socket.io la 1 thu vien javascript cho phep chung ta su dung websocket trong cac ung dung web. Trong truong hop trinh duyet qua cu, khong co websocket, thi socket.io se cung cap a fallback - 1 co che du phong de su dung websocket tren trinh duyet.

### 19.1. Install and initialize on server nodejs (with express framework) the socket.io package

```bash
npm install socket.io
npm install --save-optional bufferutil utf-8-validate
```

- add package to `index` file

```ts
const app = express()

const httpServer = createServer(app)
```

- sustitute `app.listen` for `httpServer.listen`

```ts
httpServer.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
```

- create a new instance `io` on server

```ts
// socket io
const io = new Server(httpServer, {
  /* options */
  // giver permisson for only client (localhost:3000) to get access to server
  cors: {
    origin: 'http://localhost:3000'
  }
})

// event to listen an event that ask for connection to server
io.on('connection', (socket) => {
  // console.log(socket)
  console.log(`user ${socket.id} connected`)
  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`)
  })
})
```

### 19.2. Install and initialize socket.io on client side

```bash
npm install socket.io-client
```

- add code to `Chat` page to create connection with server

```jsx
export default function Chat() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL)
    socket.on('connect', () => {
      console.log(socket.id)
    })
    socket.on('disconnect', () => {
      console.log(socket.id) // undefined
    })

    // when user leave this page, the socket on client will also be disconnected
    return () => {
      socket.disconnect()
    }
  }, [])
  return <div>Chat</div>
}
```

### 19.3. Socket Emit

- Look for `The Socket instance` in `Client` on docs of socket.io

- Server and client will use `socket.emit` to invoke events to each other. And use `socket.on` to receive event from each other.

### 19.4. User loggin from client

- Trick: loggin with api, get `access_token` and `refresh_token`.
- From client, call `/users/me` to get own profile (put it in useEffect to call api everytime refresh page again)

### 19.5. Private message between 2 people

- In this Twitter app, to send message, we need an identity for user. When a user start to chat, needs to send info line username and identity (socket id)
- At this stage, only one person can send message, the other can only receive

### 19.6. CSS of sender and receiver of messages

- display messages have been sent, not only messages have been received

### 19.7. Send and receive messages between 2 users

- to know whom we are chatting with, need to know \_id of that person
- suppose we will have username of a person

### 19.8. Design schema for data chat

- in steps before, users just exchange info, but nothing has been saved to database => thiet ke mongodb schame, create a collection to save these conversation
- Analyze: 1 user can have many messages => relationship 1 to many many

### 19.8. Route to get conversation (list of messages) even when press F5

- to get list of message of a conversation: need user_id of sender and user_id of receiver. Because our user_id is already in access_token, we don't need to pass our user_id, only pass user_id of receiver
- add pagination (limit, page, total)

### 19.9. Apply API get conversations to client chat

- on React chat page, press F5 , conversations still display, not disappear
- press F5, component will be unmounted and mounted again, so add code in useEffect

### 19.20. Add getConversationValidator and paginationValidator to route

- add `getConversationValidator` in `users.middleware`
- reuse `paginationValidator` in ``tweets.middleware`

### 19.21. Code inifinite scroll for React chat/conversations

### 19.22. Middleware for Server Instance

- use middleware socket.io to check validation of message sender. The middleware function will be executed for every upcoming connection.

- First in this step, this socket middleware will verify user becofre let user connect to sociket io, and this middleware only runs one time when connect (check authorization). => put this middleware before the `connection` event of socket.io

### 19.23. Middleware for socket instance

- Middleware will run when user sends an event (ex: send message) -> put this middleware inside `connection` event of socket.io

### 19.24. Refactor `index` file
