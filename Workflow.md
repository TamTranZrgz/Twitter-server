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
- Note 2: keep `uploads` folder in local repo, we cant shsare files with other team members. Solution will be upload files into another platform provider such as S3, or our server