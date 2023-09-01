import { ClientOptions } from 'minio'

const minioHost = process.env.MINIO_HOST
const minioPort = process.env.MINIO_PORT
const minioUser = process.env.MINIO_USER
const minioPass = process.env.MINIO_PASS

export const getMinioConfig = (): ClientOptions | { error: string } => {
    if (!minioHost || !minioPort || !minioUser || !minioPass) {
        return { error: 'Minio Vairables Are Not Set' }
    }
    return {
        endPoint: minioHost,
        port: Number(minioPort),
        useSSL: false,
        accessKey: minioUser,
        secretKey: minioPass,
    }
}
