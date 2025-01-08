import { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import HTTP_STATUS from '~/constants/httpStatus'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = await mediasService.uploadImage(req)
  // console.log(data) // an object with key `image` with info about image (filepath, newFilename, originalFilename, mimetype, size, etc.)
  res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = await mediasService.uploadVideo(req)
  // console.log(data) // an object with key `image` with info about image (filepath, newFilename, originalFilename, mimetype, size, etc.)
  res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

// After uploading video/image, we still need this part to save those files into directory
// serve static image using router, not using `express.static` built-in method of NodeJs
export const serveImageController = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.params // route: image/:name
  console.log(name)
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    // console.log(err)
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// serve static video using router, not using `express.static` built-in method of NodeJs
// however, this method only wordks for image, for video, can lead to error 'ERR_HTTP_HEADERS_SENT'
export const serveVideoController = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.params // route: image/:name
  console.log(name)
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    // console.log(err)
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// Customize `streaming` function from `express.static` middleware
// Open client side, check `network`, in `request headers`, we will se how `range` property change when the video is running
export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const mime = (await import('mime')).default // Dynamic import here
  const range = req.headers.range
  if (!range) {
    res.status(HTTP_STATUS.BAD_REQUEST).send('Require Range Header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10**6 bytes (calculating by decimal system, what we normally see on UI)
  // If calculating based on binary system, 1MB = 2**20 bytes (1024 * 1024)

  // Calculate size of video (bytes)
  const videoSize = fs.statSync(videoPath).size

  // Size of video for each streaming part
  // Note: if chunkZise is bigger than videoSize, we can not stream it
  // Note: the problem comes from 'content-range' header, must be (end - start + 1) not just (end - start)
  const chunkSize = 10 ** 6 // 1MB

  // Get bytes value starting from header range (ex: bytes=1048576-)
  const start = Number((range as string).replace(/\D/g, ''))

  // Get ending bytes value, if the value exceed videoSize, will take videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Calculate real size for each streaming video chunk
  // Normally it will be chunkSize except the last one
  const contentLength = end - start + 1 // Ex: from 1 - 10, will be 10 unit
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`, // 'end' must be less than 'videoSize'
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
