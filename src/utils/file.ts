import { Request, Response, NextFunction } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs' // inner method of nodejs to handle paths
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // create nested folder if it is neccessary
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  // fix conflict of commonJS module and ES Module (if happens)
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR, // save uploaded file to temp dir 'uploads' in root directory
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3000 * 1024, // 3000kb
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
  return new Promise<File>((resolve, reject) => {
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
      resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.') // ex: fullname = chevanon.jpg
  namearr.pop()
  return namearr.join('')
}
