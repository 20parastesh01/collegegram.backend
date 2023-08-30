export type SimpleMessage = {
    msg: string
}
export const isSimpleMessage = (value: unknown): value is SimpleMessage => {
    return typeof value == 'object' && value != null && 'msg' in value && typeof value.msg == 'string'
}
