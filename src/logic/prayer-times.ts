import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Qibla } from 'adhan';

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  timezone: string;
}

// Default coordinates for Brussels, Belgium
const DEFAULT_BELGIUM_COORDINATES: LocationCoordinates = {
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: 'Europe/Brussels'
};

const formatTime = (date: Date, timezone: string): string => {
  return date.toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCurrentPrayerTimes = async (coordinates?: LocationCoordinates): Promise<PrayerTimes> => {
  const location = coordinates || DEFAULT_BELGIUM_COORDINATES;
  
  try {
    const coords = new Coordinates(location.latitude, location.longitude);
    const date = new Date();
    
    // Use Muslim World League calculation method (widely accepted in Europe)
    const params = CalculationMethod.MuslimWorldLeague();
    // Adjust for Belgium's specific requirements
    params.fajrAngle = 18; // Standard for Belgium
    params.ishaAngle = 17; // Standard for Belgium
    
    const prayerTimes = new AdhanPrayerTimes(coords, date, params);
    
    console.log('Calculated prayer times for Belgium:', {
      Fajr: formatTime(prayerTimes.fajr, location.timezone),
      Dhuhr: formatTime(prayerTimes.dhuhr, location.timezone),
      Asr: formatTime(prayerTimes.asr, location.timezone),
      Maghrib: formatTime(prayerTimes.maghrib, location.timezone),
      Isha: formatTime(prayerTimes.isha, location.timezone),
    });
    
    return {
      Fajr: formatTime(prayerTimes.fajr, location.timezone),
      Dhuhr: formatTime(prayerTimes.dhuhr, location.timezone),
      Asr: formatTime(prayerTimes.asr, location.timezone),
      Maghrib: formatTime(prayerTimes.maghrib, location.timezone),
      Isha: formatTime(prayerTimes.isha, location.timezone),
    };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    
    // Fallback calculation
    console.log('Using fallback prayer times calculation');
    const now = new Date();
    const month = now.getMonth();
    
    // More precise seasonal calculation
    let fajr: string, asr: string, maghrib: string, isha: string;
    
    if (month >= 4 && month <= 8) { // May to September (summer)
      fajr = '04:00';
      asr = '17:45';
      maghrib = '21:15';
      isha = '23:00';
    } else if (month === 3 || month === 9) { // April and October (spring/autumn)
      fajr = '05:30';
      asr = '16:30';
      maghrib = '19:00';
      isha = '20:30';
    } else { // November to March (winter)
      fajr = '06:30';
      asr = '14:45';
      maghrib = '17:15';
      isha = '18:45';
    }
    
    return {
      Fajr: fajr,
      Dhuhr: '12:45',
      Asr: asr,
      Maghrib: maghrib,
      Isha: isha,
    };
  }
};

export const getQiblaDirection = (coordinates?: LocationCoordinates): number => {
  const location = coordinates || DEFAULT_BELGIUM_COORDINATES;
  
  try {
    const coords = new Coordinates(location.latitude, location.longitude);
    return Qibla(coords);
  } catch (error) {
    console.error('Error calculating Qibla direction:', error);
    // Fallback: approximate Qibla direction for Belgium (towards Mecca)
    // Belgium to Mecca is approximately 120 degrees (southeast)
    return 120;
  }
};

export const getNextPrayer = (prayerTimes: PrayerTimes): { name: string; time: string } | null => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayers = [
    { name: 'Fajr', time: prayerTimes.Fajr },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr },
    { name: 'Asr', time: prayerTimes.Asr },
    { name: 'Maghrib', time: prayerTimes.Maghrib },
    { name: 'Isha', time: prayerTimes.Isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      return prayer;
    }
  }
  
  // If no prayer is left today, return tomorrow's Fajr
  return { name: 'Fajr', time: prayerTimes.Fajr };
};

export const isPrayerTime = (prayerTime: string, bufferMinutes: number = 5): boolean => {
  const now = new Date();
  const [hours, minutes] = prayerTime.split(':').map(Number);
  
  const prayerDate = new Date();
  prayerDate.setHours(hours, minutes, 0, 0);
  
  const timeDiff = Math.abs(now.getTime() - prayerDate.getTime()) / (1000 * 60);
  return timeDiff <= bufferMinutes;
};