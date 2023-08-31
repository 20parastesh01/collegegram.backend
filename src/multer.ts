import multer from 'multer'

const storage = multer.memoryStorage() // You can adjust this storage method as needed
export const upload = multer({ storage: storage })