import { Request } from 'express'
import { config } from 'dotenv'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import fsPromise from 'fs/promises'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Others'
import { uploadFileToS3 } from '~/utils/s3'
config()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const mime = (await import('mime')).default // Dynamic import here
    // Use map to promise all to deal with all image files at the same time
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename) // Ex: newFilename = ef32fa420ef04456cf3bd2100.jpg

        const newFullFileName = `${newName}.jpg`

        // establish link to directory that saves uploaded files
        // filepath is the path to the `uploads` directory
        // convert all uploaded files to jpeg type
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        await sharp(file.filepath).jpeg().toFile(newPath)

        // upload file to s3
        // const s3Result = await uploadFileToS3({
        //   fileName: 'images/' + newFullFileName,
        //   filePath: newPath,
        //   contentType: mime.getType(newPath) as string
        // })

        // await Promise.all([
        //   // remove image file in temp directory
        //   fsPromise.unlink(file.filepath), // unlink the path to image file in temp directory

        //   // remove image file in images folder
        //   fsPromise.unlink(newPath)
        // ])

        // return {
        //   url: s3Result.Location as string,
        //   type: MediaType.Image
        // }

        // Upload to server, not S3
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFullFileName}`
            : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  // although we customize to upload only one video at one time, we still return an array of video, or further development
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    // console.log(files)
    const mime = (await import('mime')).default // Dynamic import here

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // upload files to s3
        const s3Result = await uploadFileToS3({
          fileName: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filePath: file.filepath
        })

        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }

        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
