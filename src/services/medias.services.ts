import { Request } from 'express'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'

class MediasService {
  async uploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename) // Ex: newFilename = ef32fa420ef04456cf3bd2100.jpg

    // establish link to directory that saves uploaded files
    // filepath is the path to the `uploads` directory
    // convert all uploaded files to jpeg type
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)

    // remove image file in temp directory
    fs.unlinkSync(file.filepath) // unlink the path to image file in temp directory

    return `http://localhost:4000/uploads/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
