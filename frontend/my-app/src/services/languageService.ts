// Language Service for Multilingual Support
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
];

// Predefined translations for common oceanographic terms
export const translations = {
  en: {
    welcome: "Hello! I'm your AI assistant FloatChat for ARGO oceanographic data. I can help you explore temperature profiles, salinity data, float locations, and generate high-quality visualizations. Ask me anything about ocean data or request custom visualizations!",
    temperature: "Temperature",
    salinity: "Salinity",
    depth: "Depth",
    argoFloat: "ARGO Float",
    oceanData: "Ocean Data",
    visualization: "Visualization",
    loading: "Loading...",
    error: "Error occurred",
    generateImage: "Generate Image",
    downloadImage: "Download Image",
    suggestions: "Suggestions",
    newChat: "New Chat",
    settings: "Settings",
    help: "Help",
    online: "Online",
    offline: "Offline",
    sendMessage: "Send Message",
    typeMessage: "Type your message...",
    recentChats: "Recent Chats",
    temperatureProfiles: "Temperature Profiles",
    salinityAnalysis: "Salinity Analysis",
    floatLocations: "Float Locations",
    dataVisualization: "Data Visualization"
  },
  hi: {
    welcome: "नमस्ते! मैं ARGO समुद्री डेटा के लिए आपका AI सहायक हूं। मैं आपको तापमान प्रोफाइल, लवणता डेटा, फ्लोट स्थानों का अन्वेषण करने और FLUX.1 का उपयोग करके उच्च गुणवत्ता वाले विज़ुअलाइज़ेशन बनाने में मदद कर सकता हूं। समुद्री डेटा के बारे में कुछ भी पूछें या कस्टम विज़ुअलाइज़ेशन का अनुरोध करें!",
    temperature: "तापमान",
    salinity: "लवणता",
    depth: "गहराई",
    argoFloat: "ARGO फ्लोट",
    oceanData: "समुद्री डेटा",
    visualization: "विज़ुअलाइज़ेशन",
    loading: "लोड हो रहा है...",
    error: "त्रुटि हुई",
    generateImage: "छवि बनाएं",
    downloadImage: "छवि डाउनलोड करें",
    suggestions: "सुझाव",
    newChat: "नई चैट",
    settings: "सेटिंग्स",
    help: "सहायता",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    sendMessage: "संदेश भेजें",
    typeMessage: "अपना संदेश टाइप करें...",
    recentChats: "हाल की चैट",
    temperatureProfiles: "तापमान प्रोफाइल",
    salinityAnalysis: "लवणता विश्लेषण",
    floatLocations: "फ्लोट स्थान",
    dataVisualization: "डेटा विज़ुअलाइज़ेशन"
  },
  ta: {
    welcome: "வணக்கம்! நான் ARGO கடல் தரவுக்கான உங்கள் AI உதவியாளர். வெப்பநிலை விவரங்கள், உப்புத்தன்மை தரவு, மிதவை இடங்களை ஆராய்வதிலும், FLUX.1 ஐப் பயன்படுத்தி உயர்தர காட்சிப்படுத்தல்களை உருவாக்குவதிலும் உங்களுக்கு உதவ முடியும். கடல் தரவு பற்றி எதையும் கேளுங்கள் அல்லது தனிப்பயன் காட்சிப்படுத்தல்களைக் கோருங்கள்!",
    temperature: "வெப்பநிலை",
    salinity: "உப்புத்தன்மை",
    depth: "ஆழம்",
    argoFloat: "ARGO மிதவை",
    oceanData: "கடல் தரவு",
    visualization: "காட்சிப்படுத்தல்",
    loading: "ஏற்றுகிறது...",
    error: "பிழை ஏற்பட்டது",
    generateImage: "படத்தை உருவாக்கு",
    downloadImage: "படத்தை பதிவிறக்கு",
    suggestions: "பரிந்துரைகள்",
    newChat: "புதிய அரட்டை",
    settings: "அமைப்புகள்",
    help: "உதவி",
    online: "ஆன்லைன்",
    offline: "ஆஃப்லைன்",
    sendMessage: "செய்தி அனுப்பு",
    typeMessage: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...",
    recentChats: "சமீபத்திய அரட்டைகள்",
    temperatureProfiles: "வெப்பநிலை விவரங்கள்",
    salinityAnalysis: "உப்புத்தன்மை பகுப்பாய்வு",
    floatLocations: "மிதவை இடங்கள்",
    dataVisualization: "தரவு காட்சிப்படுத்தல்"
  }
};

export class LanguageService {
  private currentLanguage: string = 'en';
  
  constructor() {
    // Load saved language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguage = languageCode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_language', languageCode);
      }
    }
  }

  isLanguageSupported(languageCode: string): boolean {
    return supportedLanguages.some(lang => lang.code === languageCode);
  }

  getLanguageInfo(languageCode: string): Language | undefined {
    return supportedLanguages.find(lang => lang.code === languageCode);
  }

  translate(key: string, languageCode?: string): string {
    const lang = languageCode || this.currentLanguage;
    const langTranslations = translations[lang as keyof typeof translations];
    
    if (langTranslations && langTranslations[key as keyof typeof langTranslations]) {
      return langTranslations[key as keyof typeof langTranslations];
    }
    
    // Fallback to English
    const englishTranslations = translations.en;
    return englishTranslations[key as keyof typeof englishTranslations] || key;
  }

  // Detect language from user input (basic detection)
  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    const marathiPattern = /[\u0900-\u097F]/; // Similar to Hindi
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    const kannadaPattern = /[\u0C80-\u0CFF]/;
    const malayalamPattern = /[\u0D00-\u0D7F]/;
    const punjabiPattern = /[\u0A00-\u0A7F]/;
    const odiaPattern = /[\u0B00-\u0B7F]/;
    const assamesePattern = /[\u0980-\u09FF]/; // Similar to Bengali

    if (hindiPattern.test(text)) return 'hi';
    if (tamilPattern.test(text)) return 'ta';
    if (teluguPattern.test(text)) return 'te';
    if (bengaliPattern.test(text)) return 'bn';
    if (gujaratiPattern.test(text)) return 'gu';
    if (kannadaPattern.test(text)) return 'kn';
    if (malayalamPattern.test(text)) return 'ml';
    if (punjabiPattern.test(text)) return 'pa';
    if (odiaPattern.test(text)) return 'or';
    if (assamesePattern.test(text)) return 'as';
    
    return 'en'; // Default to English
  }

  // Get multilingual suggestions based on current language
  getMultilingualSuggestions(category: string): string[] {
    const lang = this.currentLanguage;
    
    const suggestionTemplates = {
      en: {
        temperature: [
          "Show me temperature profiles in the Arabian Sea",
          "Generate an ocean temperature visualization",
          "What's the average temperature in the Indian Ocean?",
          "Create a temperature depth chart"
        ],
        salinity: [
          "Analyze salinity levels near the equator",
          "Create a salinity depth profile chart",
          "Show salinity variations in the Bay of Bengal",
          "Generate a salinity distribution map"
        ],
        visualization: [
          "Generate an ocean temperature visualization map",
          "Create a 3D ocean data visualization",
          "Visualize ARGO float locations on a world map",
          "Generate an ocean current visualization"
        ]
      },
      hi: {
        temperature: [
          "अरब सागर में तापमान प्रोफाइल दिखाएं",
          "समुद्री तापमान का विज़ुअलाइज़ेशन बनाएं",
          "हिंद महासागर में औसत तापमान क्या है?",
          "तापमान गहराई चार्ट बनाएं"
        ],
        salinity: [
          "भूमध्य रेखा के पास लवणता के स्तर का विश्लेषण करें",
          "लवणता गहराई प्रोफाइल चार्ट बनाएं",
          "बंगाल की खाड़ी में लवणता की भिन्नताएं दिखाएं",
          "लवणता वितरण मानचित्र बनाएं"
        ],
        visualization: [
          "समुद्री तापमान विज़ुअलाइज़ेशन मानचित्र बनाएं",
          "3D समुद्री डेटा विज़ुअलाइज़ेशन बनाएं",
          "विश्व मानचित्र पर ARGO फ्लोट स्थानों को विज़ुअलाइज़ करें",
          "समुद्री धारा विज़ुअलाइज़ेशन बनाएं"
        ]
      },
      ta: {
        temperature: [
          "அரபிக் கடலில் வெப்பநிலை விவரங்களைக் காட்டு",
          "கடல் வெப்பநிலை காட்சிப்படுத்தலை உருவாக்கு",
          "இந்தியப் பெருங்கடலில் சராசரி வெப்பநிலை என்ன?",
          "வெப்பநிலை ஆழ விளக்கப்படத்தை உருவாக்கு"
        ],
        salinity: [
          "பூமத்திய ரேகைக்கு அருகில் உப்புத்தன்மை அளவுகளை பகுப்பாய்வு செய்",
          "உப்புத்தன்மை ஆழ விவர விளக்கப்படத்தை உருவாக்கு",
          "வங்காள விரிகுடாவில் உப்புத்தன்மை மாறுபாடுகளைக் காட்டு",
          "உப்புத்தன்மை விநியோக வரைபடத்தை உருவாக்கு"
        ],
        visualization: [
          "கடல் வெப்பநிலை காட்சிப்படுத்தல் வரைபடத்தை உருவாக்கு",
          "3D கடல் தரவு காட்சிப்படுத்தலை உருவாக்கு",
          "உலக வரைபடத்தில் ARGO மிதவை இடங்களை காட்சிப்படுத்து",
          "கடல் நீரோட்ட காட்சிப்படுத்தலை உருவாக்கு"
        ]
      }
    };

    const langSuggestions = suggestionTemplates[lang as keyof typeof suggestionTemplates];
    if (langSuggestions && langSuggestions[category as keyof typeof langSuggestions]) {
      return langSuggestions[category as keyof typeof langSuggestions];
    }

    // Fallback to English
    return suggestionTemplates.en[category as keyof typeof suggestionTemplates.en] || [];
  }
}

export const languageService = new LanguageService();
