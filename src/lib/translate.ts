/**
 * Translation utility for converting French text to other languages using Google Translate API
 */

/**
 * Translate text using Google Translate API (unofficial)
 * @param text - Text to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Translated text
 */
async function translateWithAPI(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    // Using Google Translate's unofficial free API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    // Google Translate API returns an array structure
    // The translation is in data[0][0][0]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }

    // Fallback to original text if parsing fails
    return text;
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback to original text if API fails
    return text;
  }
}

/**
 * Translate text from French to target language
 * @param text - French text to translate
 * @param targetLang - Target language code ('en', 'it', 'es')
 * @returns Translated text
 */
export async function translateText(text: string, targetLang: 'en' | 'it' | 'es' | 'fr'): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  // For French, return as-is
  if (targetLang === 'fr') {
    return text;
  }

  // Use Google Translate API directly for all translations
  console.log(`Translating "${text}" from fr to ${targetLang}...`);
  const translated = await translateWithAPI(text, 'fr', targetLang);
  console.log(`Translation result: "${translated}"`);

  return translated;
}

/**
 * Translate multiple texts at once
 * More efficient than translating one by one
 */
export async function translateTexts(
  texts: string[],
  targetLang: 'en' | 'it' | 'es'
): Promise<string[]> {
  return Promise.all(texts.map(text => translateText(text, targetLang)));
}
