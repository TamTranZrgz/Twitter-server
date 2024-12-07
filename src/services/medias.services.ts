import { Request } from 'express'
import { config } from 'dotenv'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Others'
config()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    // Use map to promise all to deal with all image files at the same time
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename) // Ex: newFilename = ef32fa420ef04456cf3bd2100.jpg

        // establish link to directory that saves uploaded files
        // filepath is the path to the `uploads` directory
        // convert all uploaded files to jpeg type
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)

        // remove image file in temp directory
        fs.unlinkSync(file.filepath) // unlink the path to image file in temp directory

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  // although we customize to upload only one video at one time, we still return an array of video, or further development
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
