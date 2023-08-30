import { customSymbols } from '../scantypes'
import { Types } from '../types'

export const Get = (path?: string) => {
    return function (a: any, b: any, c: any) {
        setFunctionMetadata(c.value, { endpoint: true, path, method: 'get' })
    }
}

export const Post = (path?: string) => {
    return function (a: any, b: any, c: any) {
        setFunctionMetadata(c.value, { endpoint: true, path, method: 'post' })
    }
}

export const Patch = (path?: string) => {
    return function (a: any, b: any, c: any) {
        setFunctionMetadata(c.value, { endpoint: true, path, method: 'patch' })
    }
}

export const Delete = (path?: string) => {
    return function (a: any, b: any, c: any) {
        setFunctionMetadata(c.value, { endpoint: true, path, method: 'delete' })
    }
}

export const Put = (path?: string) => {
    return function (a: any, b: any, c: any) {
        setFunctionMetadata(c.value, { endpoint: true, path, method: 'put' })
    }
}

export const File = (filename: string) => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'multipart', { value: true })
        const files = c.value.singlefiles || []
        files.push(filename)
        Object.defineProperty(c.value, 'singlefiles', { value: files })
    }
}
export const Files = (filename: string) => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'multipart', { value: true })
        const files = c.value.multiplefiles || []
        files.push(filename)
        Object.defineProperty(c.value, 'multiplefiles', { value: files })
    }
}
export const Auth = () => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'auth', { value: true })
    }
}
export const Summary = (summary: string) => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'summary', { value: summary })
    }
}
export const Description = (description: string) => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'description', { value: description })
    }
}
export const Tag = (tag: string) => {
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'tag', { value: tag })
    }
}
export const RequestBody = (body: Types) => {
    const swaggerBody = customSymbols[body]
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'body', { value: swaggerBody })
    }
}
export const ResponseBody = (body: Types) => {
    const swaggerBody = customSymbols[body]
    return function (a: any, b: any, c: any) {
        Object.defineProperty(c.value, 'response', { value: swaggerBody })
    }
}

const setFunctionMetadata = (func: any, data: any) => {
    for (let key in data) {
        Object.defineProperty(func, key, { value: data[key] })
    }
}
