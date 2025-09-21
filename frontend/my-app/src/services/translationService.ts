// Translation Service using Hugging Face API
export class TranslationService {
  private apiKey: string = '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';
  private baseUrl: string = 'https://api-inference.huggingface.co/models';

  // Language code mappings for Hugging Face models
  private languageModels = {
    'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
    'hi-en': 'Helsinki-NLP/opus-mt-hi-en',
    'en-ta': 'Helsinki-NLP/opus-mt-en-ta',
    'ta-en': 'Helsinki-NLP/opus-mt-ta-en',
    'en-te': 'Helsinki-NLP/opus-mt-en-te',
    'te-en': 'Helsinki-NLP/opus-mt-te-en',
    'en-bn': 'Helsinki-NLP/opus-mt-en-bn',
    'bn-en': 'Helsinki-NLP/opus-mt-bn-en',
    'en-mr': 'Helsinki-NLP/opus-mt-en-mr',
    'mr-en': 'Helsinki-NLP/opus-mt-mr-en',
    'en-gu': 'Helsinki-NLP/opus-mt-en-gu',
    'gu-en': 'Helsinki-NLP/opus-mt-gu-en',
    'en-kn': 'Helsinki-NLP/opus-mt-en-kn',
    'kn-en': 'Helsinki-NLP/opus-mt-kn-en',
    'en-ml': 'Helsinki-NLP/opus-mt-en-ml',
    'ml-en': 'Helsinki-NLP/opus-mt-ml-en',
    'en-pa': 'Helsinki-NLP/opus-mt-en-pa',
    'pa-en': 'Helsinki-NLP/opus-mt-pa-en',
    'en-or': 'Helsinki-NLP/opus-mt-en-or',
    'or-en': 'Helsinki-NLP/opus-mt-or-en',
    'en-as': 'Helsinki-NLP/opus-mt-en-as',
    'as-en': 'Helsinki-NLP/opus-mt-as-en'
  };

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    // If same language, return original text
    if (fromLang === toLang) {
      return text;
    }

    const modelKey = `${fromLang}-${toLang}` as keyof typeof this.languageModels;
    const model = this.languageModels[modelKey];

    if (!model) {
      console.warn(`Translation model not found for ${fromLang} to ${toLang}`);
      return text; // Return original text if no model available
    }

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: 512,
            temperature: 0.3
          }
        })
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Translation model is loading. Please try again in a few moments.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key for translation service.');
        }
        throw new Error(`Translation API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0] && data[0].translation_text) {
        return data[0].translation_text;
      } else if (data.translation_text) {
        return data.translation_text;
      } else {
        console.warn('Unexpected translation response format:', data);
        return text; // Return original text if response format is unexpected
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }

  async translateToUserLanguage(text: string, userLanguage: string): Promise<string> {
    if (userLanguage === 'en') {
      return text; // No translation needed
    }

    return await this.translateText(text, 'en', userLanguage);
  }

  async translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
    if (sourceLanguage === 'en') {
      return text; // No translation needed
    }

    return await this.translateText(text, sourceLanguage, 'en');
  }

  // Enhanced oceanographic text translation with context
  async translateOceanographicText(text: string, fromLang: string, toLang: string): Promise<string> {
    // Add oceanographic context to improve translation accuracy
    const contextualText = this.addOceanographicContext(text, fromLang);
    const translatedText = await this.translateText(contextualText, fromLang, toLang);
    
    // Clean up the context markers from the translated text
    return this.cleanTranslatedText(translatedText);
  }

  private addOceanographicContext(text: string, language: string): string {
    // Add context markers to help with domain-specific translation
    const contextMarkers = {
      en: "Oceanographic data context: ",
      hi: "समुद्री डेटा संदर्भ: ",
      ta: "கடல் தரவு சூழல்: "
    };

    const marker = contextMarkers[language as keyof typeof contextMarkers] || contextMarkers.en;
    return `${marker}${text}`;
  }

  private cleanTranslatedText(text: string): string {
    // Remove context markers from translated text
    const contextPatterns = [
      /^Oceanographic data context:\s*/i,
      /^समुद्री डेटा संदर्भ:\s*/,
      /^கடல் தரவு சூழல்:\s*/
    ];

    let cleanedText = text;
    contextPatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    return cleanedText.trim();
  }

  // Batch translation for multiple texts
  async batchTranslate(texts: string[], fromLang: string, toLang: string): Promise<string[]> {
    const translations = await Promise.all(
      texts.map(text => this.translateText(text, fromLang, toLang))
    );
    return translations;
  }

  // Check if translation is supported between two languages
  isTranslationSupported(fromLang: string, toLang: string): boolean {
    const modelKey = `${fromLang}-${toLang}` as keyof typeof this.languageModels;
    return !!this.languageModels[modelKey];
  }

  // Get supported language pairs
  getSupportedLanguagePairs(): string[] {
    return Object.keys(this.languageModels);
  }

  // Translate oceanographic terms specifically
  async translateOceanographicTerms(terms: string[], fromLang: string, toLang: string): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};
    
    for (const term of terms) {
      try {
        translations[term] = await this.translateOceanographicText(term, fromLang, toLang);
      } catch (error) {
        console.error(`Failed to translate term "${term}":`, error);
        translations[term] = term; // Keep original if translation fails
      }
    }
    
    return translations;
  }
}

export const translationService = new TranslationService();
