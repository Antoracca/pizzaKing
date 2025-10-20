/* eslint-disable no-console */
// Utilitaire pour détecter automatiquement le pays de l'utilisateur
import { useEffect, useState } from 'react';

export type CountryCode = 
  | 'FR' | 'BE' | 'CH' | 'CA' | 'US' | 'GB' | 'DE' | 'IT' | 'ES' | 'PT' | 'NL' 
  | 'SE' | 'NO' | 'DK' | 'FI' | 'PL' | 'CZ' | 'AT' | 'IE' | 'LU' | 'MC' | 'AD'
  | 'CM' | 'CI' | 'SN' | 'ML' | 'BF' | 'NE' | 'TD' | 'CF' | 'CG' | 'GA' | 'GQ'
  | 'DJ' | 'KM' | 'MG' | 'YT' | 'RE' | 'GP' | 'MQ' | 'GF' | 'PM' | 'WF' | 'PF'
  | 'NC' | 'MA' | 'TN' | 'DZ' | 'EG' | 'LY' | 'SD' | 'SO' | 'ET' | 'KE' | 'UG'
  | 'TZ' | 'RW' | 'BI' | 'ZA' | 'NA' | 'BW' | 'ZW' | 'ZM' | 'MW' | 'MZ' | 'AO'
  | 'CD' | 'GH' | 'NG' | 'BJ' | 'TG' | 'LR' | 'SL' | 'GN' | 'GW' | 'CV' | 'ST';

const TIMEZONE_TO_COUNTRY: Record<string, CountryCode> = {
  // Europe francophone
  'Europe/Paris': 'FR',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Luxembourg': 'LU',
  'Europe/Monaco': 'MC',
  'Europe/Andorra': 'AD',
  
  // Amérique du Nord francophone
  'America/Montreal': 'CA',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Halifax': 'CA',
  'America/Winnipeg': 'CA',
  'America/Edmonton': 'CA',
  
  // Afrique francophone
  'Africa/Douala': 'CM',
  'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN',
  'Africa/Bamako': 'ML',
  'Africa/Ouagadougou': 'BF',
  'Africa/Niamey': 'NE',
  'Africa/Ndjamena': 'TD',
  'Africa/Bangui': 'CF',
  'Africa/Brazzaville': 'CG',
  'Africa/Libreville': 'GA',
  'Africa/Malabo': 'GQ',
  
  // Océan Indien
  'Indian/Antananarivo': 'MG',
  'Indian/Mayotte': 'YT',
  'Indian/Reunion': 'RE',
  'Indian/Comoro': 'KM',
  'Africa/Djibouti': 'DJ',
  
  // Territoires d'outre-mer français
  'America/Guadeloupe': 'GP',
  'America/Martinique': 'MQ',
  'America/Cayenne': 'GF',
  'America/Miquelon': 'PM',
  'Pacific/Wallis': 'WF',
  'Pacific/Tahiti': 'PF',
  'Pacific/Noumea': 'NC',
  
  // Maghreb et Afrique du Nord
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Africa/Cairo': 'EG',
  'Africa/Tripoli': 'LY',
  
  // Autres pays européens
  'Europe/London': 'GB',
  'Europe/Berlin': 'GB',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Lisbon': 'PT',
  'Europe/Amsterdam': 'NL',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Vienna': 'AT',
  'Europe/Dublin': 'IE',
  
  // États-Unis
  'America/New_York': 'US',
  'America/Los_Angeles': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
};

const LOCALE_TO_COUNTRY: Record<string, CountryCode> = {
  'fr-FR': 'FR',
  'fr-BE': 'BE',
  'fr-CH': 'CH',
  'fr-CA': 'CA',
  'fr-LU': 'LU',
  'fr-MC': 'MC',
  'en-CA': 'CA',
  'en-US': 'US',
  'en-GB': 'GB',
  'de-DE': 'DE',
  'de-CH': 'CH',
  'de-AT': 'AT',
  'it-IT': 'IT',
  'it-CH': 'CH',
  'es-ES': 'ES',
  'pt-PT': 'PT',
  'nl-NL': 'NL',
  'nl-BE': 'BE',
  'sv-SE': 'SE',
  'nb-NO': 'NO',
  'da-DK': 'DK',
  'fi-FI': 'FI',
  'pl-PL': 'PL',
  'cs-CZ': 'CZ',
  'ga-IE': 'IE',
  
  // Pays arabes
  'ar-MA': 'MA',
  'fr-MA': 'MA',
  'ar-TN': 'TN',
  'fr-TN': 'TN',
  'ar-DZ': 'DZ',
  'fr-DZ': 'DZ',
  'ar-EG': 'EG',
  'ar-LY': 'LY',
};

export async function detectUserCountry(): Promise<CountryCode> {
  
  
  // 1. Essayer avec une API ultra-rapide d'abord
  try {
    
    const response = await fetch('https://geo.ipify.org/api/v1?apiKey=at_free&format=json', {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.location?.country as string;
      console.log(`📍 ipify retourne: ${countryCode}`);
      
      const mappedCountry = mapToSupportedCountry(countryCode);
      if (mappedCountry) {
        console.log(`✅ Pays détecté via ipify: ${mappedCountry} (${countryCode})`);
        return mappedCountry;
      }
    }
  } catch (error) {
    console.log('❌ ipify échoué:', error);
  }

  // 2. Essayer avec l'API de géolocalisation IP (gratuite et rapide)
  try {
    console.log('🔍 Tentative avec ipapi...');
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(2000), // 2 secondes max
    });
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code as string;
      console.log(`📍 ipapi retourne: ${countryCode}`);
      
      // Convertir vers nos codes de pays supportés
      const mappedCountry = mapToSupportedCountry(countryCode);
      if (mappedCountry) {
        console.log(`✅ Pays détecté via ipapi: ${mappedCountry} (${countryCode})`);
        return mappedCountry;
      }
    }
  } catch (error) {
    console.log('❌ ipapi échoué:', error);
  }

  // 3. Essayer avec une API alternative plus rapide
  try {
    console.log('🔍 Tentative avec country.is...');
    const response = await fetch('https://api.country.is/', {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country as string;
      console.log(`📍 country.is retourne: ${countryCode}`);
      
      const mappedCountry = mapToSupportedCountry(countryCode);
      if (mappedCountry) {
        console.log(`✅ Pays détecté via country.is: ${mappedCountry} (${countryCode})`);
        return mappedCountry;
      }
    }
  } catch (error) {
    console.log('❌ country.is échoué:', error);
  }

  // 4. Utiliser le fuseau horaire
  try {
    console.log('🔍 Tentative avec fuseau horaire...');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`⏰ Fuseau horaire détecté: ${timezone}`);
    const countryFromTimezone = TIMEZONE_TO_COUNTRY[timezone];
    if (countryFromTimezone) {
      console.log(`✅ Pays détecté via fuseau horaire: ${countryFromTimezone}`);
      return countryFromTimezone;
    }
  } catch (error) {
    console.log('❌ Détection par fuseau horaire échouée:', error);
  }

  // 5. Utiliser la locale du navigateur
  try {
    console.log('🔍 Tentative avec locale navigateur...');
    const locale = navigator.language || navigator.languages?.[0];
    console.log(`🗣️ Locale détectée: ${locale}`);
    if (locale) {
      const countryFromLocale = LOCALE_TO_COUNTRY[locale];
      if (countryFromLocale) {
        console.log(`✅ Pays détecté via locale: ${countryFromLocale}`);
        return countryFromLocale;
      }
      
      // Essayer avec juste le code pays de la locale (ex: fr-FR -> FR)
      const countryCode = locale.split('-')[1];
      if (countryCode) {
        console.log(`🔍 Test avec code pays de locale: ${countryCode}`);
        const mappedCountry = mapToSupportedCountry(countryCode);
        if (mappedCountry) {
          console.log(`✅ Pays détecté via code locale: ${mappedCountry}`);
          return mappedCountry;
        }
      }
    }
  } catch (error) {
    console.log('❌ Détection par locale échouée:', error);
  }

  // 6. Fallback vers la France (pays par défaut pour Pizza King)
  console.log('🇫🇷 Fallback vers France par défaut');
  return 'FR';
}

function mapToSupportedCountry(countryCode: string): CountryCode | null {
  const code = countryCode.toUpperCase() as CountryCode;
  console.log(`🔄 Mapping du code pays: ${countryCode} -> ${code}`);
  
  // Liste des pays supportés par notre application
  const supportedCountries: CountryCode[] = [
    'FR', 'BE', 'CH', 'CA', 'US', 'GB', 'DE', 'IT', 'ES', 'PT', 'NL',
    'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'AT', 'IE', 'LU', 'MC', 'AD',
    'CM', 'CI', 'SN', 'ML', 'BF', 'NE', 'TD', 'CF', 'CG', 'GA', 'GQ',
    'DJ', 'KM', 'MG', 'YT', 'RE', 'GP', 'MQ', 'GF', 'PM', 'WF', 'PF',
    'NC', 'MA', 'TN', 'DZ', 'EG', 'LY', 'SD', 'SO', 'ET', 'KE', 'UG',
    'TZ', 'RW', 'BI', 'ZA', 'NA', 'BW', 'ZW', 'ZM', 'MW', 'MZ', 'AO',
    'CD', 'GH', 'NG', 'BJ', 'TG', 'LR', 'SL', 'GN', 'GW', 'CV', 'ST'
  ];
  
  if (supportedCountries.includes(code)) {
    console.log(`✅ Code pays supporté: ${code}`);
    return code;
  }
  
  console.log(`❌ Code pays NON supporté: ${code}`);
  return null;
}

// Hook personnalisé pour React
export function useDetectedCountry() {
  const [country, setCountry] = useState<CountryCode | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    detectUserCountry()
      .then((detectedCountry) => {
        setCountry(detectedCountry);
        console.log(`Pays finalement sélectionné: ${detectedCountry}`);
      })
      .finally(() => setIsDetecting(false));
  }, []);

  return { 
    country: country || 'FR', // Fallback vers FR si pas encore détecté
    detectedCountry: country, // Le pays réellement détecté (null si en cours)
    isDetecting 
  };
}