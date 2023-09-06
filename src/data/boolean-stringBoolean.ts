import { z } from 'zod';

const transformValidStringToBoolean = (value: unknown): any => {
  if ((typeof value === 'string' && value === 'true')) {
    return true 
  }
  else if (typeof value === 'string' && value === 'false')
    return false;
  else
    return value
};
export const isBooleanOrBooleanString = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return value === 'true' || value === 'false';
    }
    else if (typeof value === 'boolean')
      return true;
    else
      return false
  };

export const zodBooleanOrBooleanString = z.any().transform((value) => transformValidStringToBoolean(value)).refine(isBooleanOrBooleanString);
