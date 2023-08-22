import { Request, Response } from 'express'
import { HttpError } from './http-error'

export const handleExpress = async <A>(res: Response, fn: () => Promise<A>) => {
    const result = await fn()
    if (result instanceof HttpError) {
        res.status(result.status).send({ error: result.message })
    } else {
        res.status(200).send(result)
    }
    return result
}
