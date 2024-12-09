export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',

  // CHECK email or password input for login
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',

  // Email
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',

  // Name
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',

  // Password
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',

  // Confirm password
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',

  // Date of birth
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',

  // Login
  LOGIN_SUCCESS: 'Login Success',

  // Logout
  LOGOUT_SUCCESS: 'Logout Success',

  // Register
  REGISTER_SUCCESS: 'Register Success',

  // Chech access_token
  ACCESS_TOKEN_IS_REQUIRED: 'Access_token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access_token is invalid',

  // Check refresh_token
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh_token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh_token is invalid',
  REFRESH_TOKEN_IS_ALREADY_USED_OR_NOT_EXIST: 'Refresh_token is already used or not exist',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',

  // Check email_verify_token
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email_verify_token is required',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email sucess',

  // Check Google mail (gmail)
  GOOGLE_MAIL_NOT_VERIFIED: 'Google mail not verified',

  // Check user
  USER_NOT_FOUND: 'User not found',

  // Check forgot-password
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot_pasword_token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot_password_token success',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot_pasword_token',
  RESET_PASSWORD_SUCCESS: 'Reset password success',

  // Check user
  GET_ME_SUCCESS: 'Get my profile success',
  USER_NOT_VERIFIED: 'User not verified',

  // Check bio
  BIO_MUST_BE_STRING: 'Bio must be string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',

  // Location
  LOCATION_MUST_BE_STRING: 'Location must be string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location length must be from 1 to 200',

  // Website
  WEBSITE_MUST_BE_STRING: 'Website must be string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200',

  // Username
  USERNAME_MUST_BE_STRING: 'Username must be string',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Website length must be from 1 to 50',
  USERNAME_INVALID:
    'Username must be 4 - 15 characters long and contain only letters, numbers, and underscores, but not contain only numbers',
  USERNAME_EXISTED: 'Username existed',

  // Avatar / Cover photo
  IMAGE_URL_MUST_BE_STRING: 'Image url must be string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image url length must be from 1 to 400',

  // Update me
  UPDATE_ME_SUCCESS: 'Update me success',

  // Other user (not me)
  GET_USER_PROFILE_SUCCESS: 'Get user profile success',

  // Follow other user
  FOLLOW_SUCCESS: 'Follow success',
  INVALID_USER_ID: 'Invalid user_id',
  FOLLOWED: 'Followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow success',

  // Image
  UPLOAD_SUCCESS: 'Upload success'
} as const

export const TWEETS_MESSAGES = {
  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_AUDIENCE_TYPE: 'Invalid audience type',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent_id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent_id must be null',
  CONTENT_MUST_BE_NONE_EMPTY_STRING: 'Content must be none-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user_id',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
  INVALID_TWEET_ID: 'Invalid tweet_id',
  TWEET_NOT_FOUND: 'Tweet not found'
} as const

export const BOOKMARKS_MESSAGES = {
  BOOKMARKS_TWEET_SUCCESSFULLY: 'Bookmark tweet successfully',
  UNBOOKMARKS_TWEET_SUCCESSFULLY: 'Unbookmark tweet successfully'
} as const

export const LIKES_MESSAGES = {
  LIKE_TWEET_SUCCESSFULLY: 'Like tweet successfully',
  UNLIKE_TWEET_SUCCESSFULLY: 'Unlike tweet successfully'
} as const
