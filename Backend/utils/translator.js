// Simple translation utility for common job-related terms
// You can extend this with API calls to Google Translate or other services

const commonTranslations = {
  // Construction
  'construction_labour': 'निर्माण मजदूरी',
  'construction helper': 'निर्माण सहायक',
  'brickwork': 'ईंट का काम',
  'concrete': 'कंक्रीट का काम',
  'excavation': 'खुदाई',
  
  // Factory
  'factory_helper': 'कारखाना सहायक',
  'machine operator': 'मशीन ऑपरेटर',
  'assembly': 'विधानसभा',
  'packing': 'पैकिंग',
  
  // Farm
  'farm_worker': 'खेत मजदूर',
  'harvesting': 'फसल कटाई',
  'planting': 'बुवाई',
  'irrigation': 'सिंचाई',
  
  // Domestic
  'domestic_help': 'घरेलू मदद',
  'cleaner': 'सफाई कर्मचारी',
  'cook': 'रसोइया',
  'gardener': 'माली',
  
  // Common words
  'immediate': 'तुरंत',
  'experienced': 'अनुभवी',
  'no experience': 'बिना अनुभव के',
  'full time': 'पूरा समय',
  'part time': 'अंशकालिक',
  'flexible': 'लचकदार',
  'accommodation': 'आवास',
  'meals': 'भोजन',
  'transport': 'परिवहन',
};

// Function to translate text (simple lookup + can be extended to API)
const translateText = (text, language = 'hi') => {
  if (!text || language === 'en') {
    return text;
  }

  if (language === 'hi') {
    // Check if direct translation exists
    if (commonTranslations[text.toLowerCase()]) {
      return commonTranslations[text.toLowerCase()];
    }

    // For more complex translations, you could integrate Google Translate API here
    // For now, return original text if no translation found
    return text;
  }

  return text;
};

// Function to translate job description (handles sentences)
const translateDescription = async (text, language = 'hi') => {
  if (!text || language === 'en') {
    return text;
  }

  if (language === 'hi') {
    // Split into sentences and translate key terms
    let translatedText = text;
    
    Object.keys(commonTranslations).forEach(key => {
      const regex = new RegExp(key, 'gi');
      translatedText = translatedText.replace(regex, commonTranslations[key]);
    });

    return translatedText;
  }

  return text;
};

// Function to auto-generate Hindi translation using Google Translate API
const autoTranslateWithAPI = async (text, targetLanguage = 'hi') => {
  try {
    // Option 1: Using Google Translate API (requires API key)
    // This is a placeholder - implement based on your API choice
    
    // Option 2: Using LibreTranslate API (free, open-source)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLanguage,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Return original text if translation fails
  }
};

module.exports = {
  translateText,
  translateDescription,
  autoTranslateWithAPI,
  commonTranslations,
};
