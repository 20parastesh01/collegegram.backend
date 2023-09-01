// import * as minio from 'minio'
// import { UserId } from './modules/user/model/user-id'
// import { Express } from 'express'
// import http from 'http'

// const minioHost = process.env.MINIO_HOST!
// const minioPort = process.env.MINIO_PORT!
// const minioUser = process.env.MINIO_USER!
// const minioPass = process.env.MINIO_PASS!

// export const profilePhotoBucket = 'userprofile'
// export const postPhotoBucket = 'post'

// export class Minio {
//     private client
//     constructor() {
//         this.client = new minio.Client({
//             endPoint: minioHost,
//             port: Number(minioPort),
//             useSSL: false,
//             accessKey: minioUser,
//             secretKey: minioPass,
//         })
//     }

//     private async createBucketIfNotExists(bucketName: string) {
//         const exists = await this.client.bucketExists(bucketName)
//         if (!exists) await this.client.makeBucket(bucketName)
//     }

//     private convert(originalUrl: string) {
//         return minioHost + ':' + minioPort + '/' + originalUrl.substring(originalUrl.indexOf('/file/') + 6)
//     }

//     async initialize(app: Express) {
//         this.createBucketIfNotExists(profilePhotoBucket)
//         this.createBucketIfNotExists(postPhotoBucket)
//         app.get('/file/*', (req, res) => {
//             const url = req.url
//             const minioUrl = this.convert(url)
//             console.log(minioUrl)
//             http.get(minioUrl, (responseFromMinio) => {
//                 responseFromMinio.pipe(res)
//             }).on('error', (error) => {
//                 console.error('Error proxying the pre-signed URL:', error)
//                 res.status(500).send('Error proxying the pre-signed URL')
//             })
//         })
//     }

//     async uploadProfile(userId: UserId, file: Express.Multer.File) {
//         await this.client.putObject(profilePhotoBucket, userId + '', file.buffer)
//     }

//     async getProfileUrl(userId: UserId) {
//         try {
//             const stat = await this.client.statObject(profilePhotoBucket, userId + '')
//             const minioUrl = await this.client.presignedUrl('GET', profilePhotoBucket, userId + '')
//             return '/file' + minioUrl.split(minioHost + ':' + minioPort)[1]
//         } catch (e) {
//             return ''
//         }
//     }

//     async removeProfileUrl(userId: UserId) {
//         await this.client.removeObject(profilePhotoBucket, userId + '')
//     }

//     async uploadPostPhoto(postId: number, files: Express.Multer.File[]) {
//         for (let i = 0; i < files.length; i++) {
//             await this.client.putObject(postPhotoBucket, postId + '-' + (i + 1), files[i].buffer)
//         }
//         return files.length
//     }

//     async getPostPhotoUrl(postId: number) {
//         const result = []
//         const minioUrl = await this.client.presignedUrl('GET', postPhotoBucket, postId + '')
//         result.push('/file' + minioUrl.split(minioHost + ':' + minioPort)[1])
//         return result
//     }

//     async deletePostPhoto(postId: number, count: number) {
//         for (let i = 1; i <= count; i++) {
//             await this.client.removeObject(postPhotoBucket, postId + '-' + i)
//         }
//     }
// }
