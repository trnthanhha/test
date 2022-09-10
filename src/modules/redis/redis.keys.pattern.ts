export const generateRedisKey = (serviceName: string, ...key) => {
  return `${serviceName}:${key.join(':')}`;
};
