import { useMemo } from "react";
import { useSettings } from "../contexts/settings/settings.context";
import { Location } from "../interfaces";

export default function useUserLocation() {
  const { location: userLocation } = useSettings();

  const location: Location | undefined = useMemo(() => {
    const latlng = userLocation;
    if (!latlng || typeof latlng !== 'string') {
      return undefined;
    }

    const [latitude, longitude] = latlng.split(',');
    if (!latitude || !longitude) {
      return undefined;
    }

    return {
      latitude,
      longitude,
    };
  }, [userLocation]);

  return location;
}
