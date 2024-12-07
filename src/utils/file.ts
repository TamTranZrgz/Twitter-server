import { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs' // inner method of nodejs to handle paths
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

// Create directory for image and video
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // create nested folder if it is neccessary
      })
    }
  })
}

// upload multiple images including upload one single image
export const handleUploadImage = async (req: Request) => {
  // fix conflict of commonJS module and ES Module (if happens)
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, // save uploaded file to temp dir 'uploads' in root directory
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 1000 * 1024, // 1000kb each file
    maxTotalFileSize: 1000 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      // 'name' is the key, 'originalFilename' is the name of file, 'mimetype' is the data type
      // check 'key' name and data type
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // console.log({ name, originalFilename, mimetype })
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  // turn callback into promise
  return new Promise<File[]>((resolve, reject) => {
    // callback
    form.parse(req, (err, fields, files) => {
      // console.log('fields', fields)
      // console.log('files', files)
      // console.log('err', err)
      if (err) {
        return reject(err) // use reject so Promise will become promise reject
      }

      // If no file uploaded, files.image will be undefined, !Boolean(..) will be false
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[]) // return an array of files
    })
  })
}

// upload videos
export const handleUploadVideo = async (req: Request) => {
  // fix conflict of commonJS module and ES Module (if happens)
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, // save uploaded file to temp dir 'uploads' in root directory
    maxFiles: 1,
    // keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB each file
    // maxTotalFileSize: 1000 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      // 'name' is the key, 'originalFilename' is the name of file, 'mimetype' is the data type
      // check 'key' name and data type
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      // console.log({ name, originalFilename, mimetype })
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  // turn callback into promise
  return new Promise<File[]>((resolve, reject) => {
    // callback
    form.parse(req, (err, fields, files) => {
      // console.log('fields', fields)
      // console.log('files', files)
      // console.log('err', err)
      if (err) {
        return reject(err) // use reject so Promise will become promise reject
      }

      // If no file uploaded, files.image will be undefined, !Boolean(..) will be false
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        video.newFilename = video.newFilename + '.' + ext
      })
      resolve(files.video as File[]) // return an array of files
    })
  })
}

export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.') // ex: fullname = chevanon.jpg
  namearr.pop()
  return namearr.join('')
}

export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
