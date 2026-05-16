import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { storageApproachesEnum } from '../enums/multerEnum.js'
import { allowedFileFormat, fileFilter } from './multer.validation.js'


function cloudFileUpload({ storageApproach = storageApproachesEnum.Memory , allowedformat=allowedFileFormat.img ,fileSize = 5 }: { storageApproach?: storageApproachesEnum; allowedformat?: string[]; fileSize?: number }) {

const storage = storageApproach == storageApproachesEnum.Memory ? multer.memoryStorage() : multer.diskStorage({

    destination: function (req, file, callback) {
      callback(null, tmpdir())
    },
    filename: function (req, file, callback) {

      callback(null,  `${randomUUID()}_${file.originalname}`)
    }


})

    return multer({ storage , fileFilter: fileFilter(allowedformat) ,limits:{fileSize: fileSize * 1024 * 1024} })
}


export default cloudFileUpload


