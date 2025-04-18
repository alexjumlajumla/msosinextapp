import { useEffect, useState } from "react";
import { DEFAULT_LOCATION } from "constants/config";

export default function useUserLocation() {
  const [location, setLocation] = useState({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    address: DEFAULT_LOCATION.address,
  });

  useEffect(() => {
    // Try to get user's location, fallback to Dar es Salaam if not available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: location.address, // Keep existing address until geocoded
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Fallback to Dar es Salaam
          setLocation({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
            address: DEFAULT_LOCATION.address,
          });
        }
      );
    }
  }, []);

  return location;
}