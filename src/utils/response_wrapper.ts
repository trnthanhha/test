import { instanceToPlain } from 'class-transformer';

export function getObjectExcludedFields(object: any, except?: Array<string>) {
  const wrapper = instanceToPlain(object);
  if (except.length) {
    except.forEach((field) => {
      wrapper[field] = object[field];
    });
  }

  return wrapper;
}
