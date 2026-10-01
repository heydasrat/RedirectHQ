import multer from 'multer'
import path from "path"
import { tmpdir } from "os"
import { mkdir } from "fs/promises"

/* OLD IMPLEMENTATION - KEPT FOR REFERENCE
const uploadDirectory = fileURLToPath(new URL("../../tmp/avatar-uploads", import.meta.url))
*/

// NEW VERCEL-COMPATIBLE IMPLEMENTATION: serverless functions can write under the OS temp directory.
const uploadDirectory = path.join(tmpdir(), "redirecthq-avatar-uploads")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    mkdir(uploadDirectory, { recursive: true })
      .then(() => cb(null, uploadDirectory))
      .catch(cb)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, path.basename(file.fieldname) + '-' + uniqueSuffix)
  }
})

const upload = multer({
  storage,
  /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: limits: { fileSize: 5 * 1024 * 1024, files: 1 } */
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/jpeg") {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname))
      return
    }
    cb(null, true)
  },
})
export default upload