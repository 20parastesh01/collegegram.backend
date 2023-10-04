import * as minio from 'minio'
import { Express } from 'express'
import http from 'http'
import { getMinioConfig } from './mino.config'
import { UserId } from '../user/model/user-id'
import path from 'path'
import { PostId } from '../post/model/post-id'
import fs from 'fs'

export const profilePhotoBucket = 'userprofile'
export const postPhotoBucket = 'post'

export class Minio {
    private client
    private config
    constructor() {
        const getConfigResult = getMinioConfig()
        if ('error' in getConfigResult) {
            console.log(getConfigResult.error)
        } else {
            this.client = new minio.Client(getConfigResult)
            this.config = getConfigResult
        }
    }

    private async createBucketIfNotExists(bucketName: string) {
        if (!this.client) return console.log('Minio Is Not Running')
        const exists = await this.client.bucketExists(bucketName)
        if (!exists) await this.client.makeBucket(bucketName)
    }

    convert(originalUrl: string) {
        if (!this.client || !this.config) return console.log('Minio Is Not Running')
        return this.config.endPoint + ':' + this.config.port + '/' + originalUrl.substring(originalUrl.indexOf('/file/') + 6)
    }

    async initialize() {
        this.createBucketIfNotExists(profilePhotoBucket)
        this.createBucketIfNotExists(postPhotoBucket)
    }

    async uploadProfile(userId: UserId, file: Express.Multer.File) {
        if (!this.client) return console.log('Minio Is Not Running')
        await this.client.putObject(profilePhotoBucket, userId + '', file.buffer)
    }

    async getProfileUrl(userId: UserId) {
        if (!this.client || !this.config) return console.log('Minio Is Not Running')
        try {
            const stat = await this.client.statObject(profilePhotoBucket, userId + '')
            const minioUrl = await this.client.presignedUrl('GET', profilePhotoBucket, userId + '')
            return minioUrl
        } catch (e) {
            try {
                const stat = await this.client.statObject(profilePhotoBucket, '0')
                const minioUrl = await this.client.presignedUrl('GET', profilePhotoBucket, '0')
                return minioUrl
            } catch (ee) {
                return ''
            }
        }
    }

    async removeProfileUrl(userId: UserId) {
        if (!this.client) return console.log('Minio Is Not Running')
        await this.client.removeObject(profilePhotoBucket, userId + '')
    }

    async uploadPostPhoto(postId: PostId, files: Express.Multer.File[]) {
        if (!this.client) return console.log('Minio Is Not Running')
        for (let i = 0; i < files.length; i++) {
            await this.client.putObject(postPhotoBucket, postId + '-' + (i + 1), files[i].buffer)
        }
        return files.length
    }

    getObjectListByPrefix(prefix: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.config) {
                console.log('Minio Is Not Running')
                return reject()
            }
            const objectListStream = this.client.listObjectsV2(postPhotoBucket, prefix)
            const objectList: string[] = []
            objectListStream.on('data', function (obj) {
                objectList.push((obj as any).name)
            })
            objectListStream.on('end', () => {
                resolve(objectList)
            })
        })
    }

    async getPostPhotoUrl(postId: PostId) {
        if (!this.client || !this.config) {
            console.log('Minio Is Not Running')
            return undefined
        }
        const result: any = []
        const objectList: string[] = await this.getObjectListByPrefix(postId + '-')
        for (let i = 1; i <= objectList.length; i++) {
            const minioUrl = await this.client.presignedUrl('GET', postPhotoBucket, postId + '-' + i)
            result.push(minioUrl)
        }
        return result
    }

    async deletePostPhoto(postId: PostId) {
        if (!this.client) return console.log('Minio Is Not Running')
        const objectList: string[] = await this.getObjectListByPrefix(postId + '-')
        for (let i = 1; i <= objectList.length; i++) {
            await this.client.removeObject(postPhotoBucket, postId + '-' + i)
        }
    }

    async setDefaultProfileProfile() {
        if (!this.client || !this.config) return console.log('Minio Is Not Running')
        try {
            const stat = await this.client.statObject(profilePhotoBucket, '0')
        } catch (e) {
            await this.client.fPutObject(profilePhotoBucket, '0', path.join(process.cwd(), 'raw', 'default_profile.jpg'))
        }
    }
}
