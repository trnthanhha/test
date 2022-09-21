import { Location } from './entities/location.entity';

export const MeterPerDegree = 111045;

export const getBoundsByRadius = (
  lat: number,
  long: number,
  radius: number,
) => {
  const delta = radius / MeterPerDegree;
  return {
    safe_zone_top: lat + delta,
    safe_zone_bot: lat - delta,
    safe_zone_left: long - delta,
    safe_zone_right: long + delta,
  };
};

export const getDistanceBetween = (loc1: Location, loc2: Location): number => {
  const height = Math.abs(loc1.lat - loc2.lat);
  const length = Math.abs(loc1.long - loc2.long);
  const distance = Math.sqrt(
    Math.pow(height * MeterPerDegree, 2) + Math.pow(length * MeterPerDegree, 2),
  );
  if (process.env?.enable_log) {
    console.log('distance between 2 points: ', distance);
  }
  return distance;
};
