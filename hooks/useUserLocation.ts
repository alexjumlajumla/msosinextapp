import { useEffect, useState } from "react";
import { DEFAULT_LOCATION } from "constants/config";

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export default function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    address: DEFAULT_LOCATION.address,
  });

  useEffect(() => {
    // Try to get user's location from localStorage first
    const cachedLocation = localStorage.getItem('user_location');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        setLocation(parsed);
      } catch (e) {
        console.error('Failed to parse cached location:', e);
      }
    }

    // Then try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: location.address, // Keep existing address until geocoded
          };
          setLocation(newLocation);
          // Cache the location
          localStorage.setItem('user_location', JSON.stringify(newLocation));
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Only set default if we don't have cached location
          if (!cachedLocation) {
            setLocation({
              latitude: DEFAULT_LOCATION.latitude,
              longitude: DEFAULT_LOCATION.longitude,
              address: DEFAULT_LOCATION.address,
            });
          }
        }
      );
    }
  }, []);

  return location;
}