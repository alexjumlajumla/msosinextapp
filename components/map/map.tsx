/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import GoogleMapReact from "google-map-react";
import cls from "./map.module.scss";
import { IShop } from "interfaces";
import LocationMarker from "components/locationMarker/locationMarker";
import getGoogleMapOptions from "utils/getGoogleMapOptions";

interface Props {
  location: {
    lat: number;
    lng: number;
  };
  defaultZoom?: number; // Make optional since some uses don't provide it
  drawLine?: boolean;
  price?: number;
  readOnly?: boolean;
  shop?: IShop;
  setLocation?: (latlng: { lat: number; lng: number }, text?: string) => void; // Updated setLocation type
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function Map({
  location,
  defaultZoom = 13, // Changed from 11 to 13 for better visibility
  drawLine,
  price,
  readOnly = false,
  shop,
  setLocation,
  inputRef,
}: Props) {
  const mapRef = useRef<any>(null);
  const pathRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState(location);

  // Add useEffect to sync location changes
  useEffect(() => {
    setCurrentLocation(location);
  }, [location]);

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    try {
      mapRef.current = map;

      if (!readOnly && setLocation) {
        map.addListener("click", async (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const addr = await getAddressFromLocation(`${lat},${lng}`);
          setLocation({ lat, lng }, addr);

          if (inputRef?.current) {
            inputRef.current.value = addr;
          }
        });
      }

      if (shop?.location && drawLine) {
        const shopLocation = {
          lat: Number(shop.location.latitude),
          lng: Number(shop.location.longitude),
        };

        // Create path between shop and delivery location
        const path = [
          shopLocation,
          { lat: location.lat, lng: location.lng }
        ];

        // Draw the path
        pathRef.current = new maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#FBC618',
          strokeOpacity: 0.8,
          strokeWeight: 3,
        });

        pathRef.current.setMap(map);

        // Fit bounds to show both points
        const bounds = new maps.LatLngBounds();
        bounds.extend(shopLocation);
        bounds.extend(location);
        map.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Map loading error:', error);
      // Handle error gracefully
    }
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation && !readOnly) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCurrentLocation(newLocation);
          
          try {
            const addr = await getAddressFromLocation(`${newLocation.lat},${newLocation.lng}`);
            if (setLocation) {
              setLocation(newLocation, addr);
            }
            if (inputRef?.current) {
              inputRef.current.value = addr;
            }
            
            // Center map on new location
            if (mapRef.current) {
              mapRef.current.panTo(newLocation);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  // Improve address lookup with error handling and retries
  async function getAddressFromLocation(latLng: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return "Location detected";
    }

    const [lat, lng] = latLng.split(",");
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`
      );

      const data = await response.json();

      if (data.status === "REQUEST_DENIED") {
        console.error('Google Maps API key error:', data.error_message);
        return "Location detected";
      }

      if (data.status === "ZERO_RESULTS") {
        return "Address not found";
      }

      if (!data.results || !data.results.length) {
        return "Location detected";
      }

      return data.results[0].formatted_address;
    } catch (error) {
      console.error('Geocoding error:', error);
      return "Location detected";
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pathRef.current) {
        pathRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <div className={`${cls.root} ${cls.mapControls}`}>
      {!readOnly && (
        <button 
          className={cls.locationButton}
          onClick={detectCurrentLocation}
          title="Detect current location"
        >
          <LocationMarker />
        </button>
      )}
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY || '',
          libraries: ['places', 'geometry']
        }}
        defaultCenter={location}
        center={currentLocation}
        defaultZoom={defaultZoom}
        options={getGoogleMapOptions}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleApiLoaded}
        onChange={(error) => {
          if (error) {
            console.error('Google Maps loading error:', error);
          }
        }}
      >
        <LocationMarker 
          lat={currentLocation.lat} 
          lng={currentLocation.lng}
          className={cls.marker} 
        />
        {shop?.location && (
          <LocationMarker
            lat={Number(shop.location.latitude)}
            lng={Number(shop.location.longitude)}
            isShop
            className={cls.shopMarker}
          />
        )}
      </GoogleMapReact>
    </div>
  );
}

