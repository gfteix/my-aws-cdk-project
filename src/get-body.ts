import { z } from "zod"
import { BadRequestError } from "./errors/bad-request-error"

export function getValidBody<T> (schema: z.ZodObject<any, any, any>, body: string | null): T {
    if(!body) {
      throw new BadRequestError('getValidBody', 'No body to be parsed!')
    }

    const result = schema.safeParse(
        JSON.parse(body)
    )

    if(!result.success) {
        throw new BadRequestError(
            'getValidBody',
            JSON.stringify(result.error)
        )
    }

    return result.data as T
}
