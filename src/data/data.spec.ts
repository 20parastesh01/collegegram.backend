import { isWholeNumber, WholeNumber } from './whole-number'

describe('Test Custom Data Types', () => {
    describe('Whole Number', () => {
        it('should fail if it is not an positive integer number', () => {
            expect(isWholeNumber('2')).toBe(false)
            expect(isWholeNumber('a')).toBe(false)
            expect(isWholeNumber(5.5)).toBe(false)
            expect(isWholeNumber(0)).toBe(false)
            expect(isWholeNumber(-0.5)).toBe(false)
            expect(isWholeNumber(-1)).toBe(false)
        })
        it('should return true if it is an integer', () => {
            let a = 5
            const result = isWholeNumber(a)
            expect(result).toBe(true)
        })
    })
})
