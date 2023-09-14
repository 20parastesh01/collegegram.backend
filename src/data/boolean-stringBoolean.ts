import { z } from 'zod';

const transformValidStringToBoolean = (value: unknown): boolean => {
  if ((typeof value === 'string' && value === 'true')) {
    return true 
  }
  else if (typeof value === 'string' && value === 'false')
    return false;
  else if (typeof value === 'boolean')
    return value;
  else
    return false
};
export const isBooleanOrBooleanString = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return (value === 'true' || value === 'false');
    }
    else if (typeof value === 'boolean')
      return true;
    else
      return false
  };

export const zodBooleanOrBooleanString = z.union([z.boolean(),z.string().nonempty()]).transform((value) => transformValidStringToBoolean(value)).refine(isBooleanOrBooleanString);
