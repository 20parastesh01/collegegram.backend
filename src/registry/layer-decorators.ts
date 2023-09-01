import { Router } from 'express'
import { authMiddleware } from '../auth-middleware'
import { AppDataSource } from '../data-source'
import { upload } from '../multer'

let title = 'CollegeGram API'
let version = '1.0.0'
export const swaggerObject: any = {
    openapi: '3.0.1',
    info: {
        title,
        version,
    },
    components: {
        securitySchemes: {
            jwt: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    paths: {},
}

const repos: any = {}
export const routes: any = []
export const services: any = {}

export const Repo = (): ClassDecorator => {
    return (target: any) => {
        const instance = new target(AppDataSource)
        repos[target.name] = instance
    }
}

export const Service = (...deps: any[]): ClassDecorator => {
    return (target: any) => {
        if (deps.map((dep) => dep.name).every((name) => name in repos)) {
            const newArgs = []
            for (let dep of deps) {
                newArgs.push(repos[dep.name])
            }
            const instance = new target(...newArgs)
            services[target.name] = instance
        }
    }
}

const extractPathParameters = (path: string) => {
    const regex = /\/:([^/]+)/g
    const matches = path.match(regex)
    let pathparameters: any = []
    if (matches) {
        matches
            .map((match) => match.slice(2))
            .forEach((param) =>
                pathparameters.push({
                    name: param,
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                })
            )
        return pathparameters
    } else {
        return []
    }
}

const getTag = (givenTag: string, basePath: string) => {
    let tag = givenTag || ''
    if (!tag) {
        let defualtTag = basePath.substring(1).split('/')[0]
        defualtTag = defualtTag[0].toUpperCase() + defualtTag.substring(1)
        tag = defualtTag
    }
    return tag
}

const getResponses = (response: any) => {
    let content = {}
    if (response) {
        content = {
            schema: {
                type: 'object',
                ...response,
            },
        }
    }
    return { '200': { description: 'ok', content: { 'application/json': content } } }
}

export const Route = (basePath: string, ...deps: any[]): ClassDecorator => {
    return (target: any) => {
        const userService = services['UserService']
        if (userService) {
            if (deps.map((dep) => dep.name).every((name) => name in services)) {
                const newArgs = []
                for (let dep of deps) {
                    newArgs.push(services[dep.name])
                }
                const router = Router()
                const instance = new target(...newArgs)
                for (let key of Object.getOwnPropertyNames(target.prototype)) {
                    if (instance[key].endpoint) {
                        const apiDef = instance[key]
                        const { auth, method, path: givenPath, summary, description, givenTag, multipart, response, body, singlefiles, multiplefiles } = apiDef
                        let path: string = basePath + (givenPath || '')
                        let tag = getTag(givenTag, basePath)

                        const api: any = {}
                        let pathparameters = extractPathParameters(path)
                        if (pathparameters.length > 0) {
                            api.parameters = [...(api.parameters || []), ...pathparameters]
                        }
                        path = path.replace(/:(\w+)/g, '{$1}')

                        if (auth) api.security = [{ jwt: [] }]

                        api.summary = (summary || '').trim()
                        api.description = (description || '').trim()
                        api.tags = [tag]
                        api.responses = getResponses(response)
                        let contentType = multipart ? 'multipart/form-data' : 'application/json'
                        if (method != 'get') {
                            if (body) {
                                api.requestBody = { content: { [contentType]: { schema: { type: 'object', ...body } } } }
                            }
                            if ((singlefiles || multiplefiles) && !api.requestBody) api.requestBody = { content: { [contentType]: { schema: { type: 'object', properties: {} } } } }
                            if (singlefiles) {
                                for (let field of singlefiles) {
                                    api.requestBody.content[contentType].schema.properties[field] = { type: 'string', format: 'binary' }
                                }
                            }
                            if (multiplefiles) {
                                for (let field of multiplefiles) {
                                    api.requestBody.content[contentType].schema.properties[field] = { type: 'array', items: { type: 'string', format: 'binary' } }
                                }
                            }
                        }

                        if (!swaggerObject.paths[path]) swaggerObject.paths[path] = {}
                        swaggerObject.paths[path][method] = api
                        const callbacks: any[] = []
                        if (auth) callbacks.push(authMiddleware(userService))
                        let multerFields: any[] = []
                        if (singlefiles && singlefiles.length > 0)
                            multerFields = [
                                ...multerFields,
                                ...singlefiles.map((a: any) => {
                                    return { name: a }
                                }),
                            ]
                        if (multiplefiles && multiplefiles.length > 0)
                            multerFields = [
                                ...multerFields,
                                ...multiplefiles.map((a: any) => {
                                    return { name: a }
                                }),
                            ]
                        if (multerFields.length > 0) callbacks.push(upload.fields(multerFields))
                        callbacks.push(apiDef.bind(instance))
                        ;(router as any)[method](path, ...callbacks)
                    }
                    routes.push(router)
                }
            }
        }
    }
}
