function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  
  // Convert coordinates to numbers and validate ranges
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);
  
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) return 0;
  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}