import { Request } from 'express'
import { NaturalNumber, isNaturalNumber } from './natural-number'

export interface PaginationInfo {
    page: NaturalNumber
    pageSize: NaturalNumber
}

const extractPageFromRequestQuery = (req: Request) => {
    if (req.query.page && isNaturalNumber(req.query.page)) return Number(req.query.page) as NaturalNumber
    return 1 as NaturalNumber
}

const extractPageSizeFromRequestQuery = (req: Request) => {
    if (req.query.page && isNaturalNumber(req.query.pageSize)) return Number(req.query.pageSize) as NaturalNumber
    return 25 as NaturalNumber
}

export const extractPaginationInfo = (req: Request) => {
    const page = extractPageFromRequestQuery(req)
    const pageSize = extractPageSizeFromRequestQuery(req)
    return { page, pageSize } as PaginationInfo
}
