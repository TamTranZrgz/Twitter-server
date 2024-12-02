import { Request, Response, NextFunction } from 'express'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const result = await mediasService.uploadSingleImage(req)
  // console.log(data) // an object with key `image` with info about image (filepath, newFilename, originalFilename, mimetype, size, etc.)
  res.json({
    result: result
  })
}
