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
            verify: UserVerifyStatus.Verified,
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
        }, [
        {
          // update email_verify_token
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }]
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
- `index` asc (ex: name_1) and des (ex: age_-1)

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