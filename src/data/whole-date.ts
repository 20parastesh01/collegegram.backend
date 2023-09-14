import { z } from 'zod';
import { Brand } from '../utility/brand';

export type WholeDate = Brand<Date, 'Whole Date'>;
export const isWholeDate = (value : unknown): value is WholeDate => {
    return  value instanceof Date && !isNaN(value.getTime())
}

export const zodWholeDate = z.date().refine(isWholeDate);