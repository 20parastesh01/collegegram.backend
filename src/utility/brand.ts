import { z } from 'zod'

export type Brand<A, B extends string> = A & z.BRAND<B>
