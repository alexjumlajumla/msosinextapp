import { DEFAULT_LOCATION } from "constants/config";

interface GoogleMapOptions {
  fullscreenControl: boolean;
  zoomControl: boolean;
  mapTypeControl: boolean;
  scaleControl: boolean;
  streetViewControl: boolean;
  rotateControl: boolean;
  clickableIcons: boolean;
  keyboardShortcuts: boolean;
  styles: Array<{
    featureType: string;
    elementType: string;
    stylers: Array<{ visibility: string }>;
  }>;
}

export default function getGoogleMapOptions(): GoogleMapOptions {
  return {
    fullscreenControl: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    clickableIcons: false,
    keyboardShortcuts: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };
}