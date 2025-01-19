import { Upload } from '@aws-sdk/lib-storage'
import { S3 } from '@aws-sdk/client-s3'
import { envConfig } from '~/constants/config'
import path from 'path'
import fs from 'fs'

const s3 = new S3({
  region: envConfig.awsRegion,
  credentials: {
    // locate inside IAM service -> Users , use the same with SES (send email)
    secretAccessKey: envConfig.awsSecretAccessKey as string,
    accessKeyId: envConfig.awsAccessKeyId as string
  }
})

// call to s2 on AWS to check how many bucket we have
// s3.listBuckets({}).then((data) => console.log(data)) // to show buckets

// Test Upload file to s3
//const file = fs.readFileSync(path.resolve('uploads/images/78185520338f6bd3bc4d2fe00.jpg'))

// upload file
export const uploadFileToS3 = ({
  fileName,
  filePath,
  contentType
}: {
  fileName: string
  filePath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: 'twitter-clone-eu-west-3',
      Key: fileName,
      Body: fs.readFileSync(filePath),
      ContentType: contentType
    },

    // optional tags
    tags: [
      /*...*/
    ],

    // additional optional fields show default values below:

    // (optional) concurrency configuration
    queueSize: 4,

    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,

    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  })
  return parallelUploads3.done()
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => {
//   console.log(res)
// })
