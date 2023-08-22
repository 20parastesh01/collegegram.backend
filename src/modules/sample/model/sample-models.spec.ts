import { isSampleId } from './sample-id'

describe('Sample Related Models', () => {
    describe('SampleId', () => {
        it('should fail if it is not an positive integer number', () => {
            expect(isSampleId('2')).toBe(false)
            expect(isSampleId('a')).toBe(false)
            expect(isSampleId(5.5)).toBe(false)
            expect(isSampleId(0)).toBe(false)
            expect(isSampleId(-0.5)).toBe(false)
            expect(isSampleId(-1)).toBe(false)
        })
        it('should return true if it is an integer', () => {
            let a = 5
            const result = isSampleId(a)
            expect(result).toBe(true)
        })
    })
})
