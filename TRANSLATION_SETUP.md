# Automatic Translation Setup Guide

## Overview
This application now uses **Google Cloud Translation API** to automatically translate all content when the language is changed. No hardcoding required!

## Setup Steps

### 1. Get Google Cloud Translation API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Translation API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Translation API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure Environment Variable

1. Create a `.env` file in the `client` folder:
   ```bash
   cd client
   cp .env.example .env
   ```

2. Add your API key to `.env`:
   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=YOUR_API_KEY_HERE
   VITE_API_URL=http://localhost:5000/api
   ```

### 3. How It Works

The system now includes:

1. **LanguageContext** (`src/context/LanguageContext.jsx`)
   - Manages language state
   - Calls Google Translate API
   - Caches translations for performance

2. **TranslateText Component** (`src/components/TranslateText.jsx`)
   - Automatically translates any text content
   - Works with simple strings and complex JSX

3. **Supported Languages**:
   - English (en) - Default
   - Amharic (am) - አማርኛ
   - Afaan Oromoo (om) - Afaan Oromoo

### 4. Usage in Components

#### Option 1: Using the translation function (Recommended)

```jsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { tSync } = useLanguage();
  
  return (
    <div>
      <h1>{tSync('Home')}</h1>
      <p>{tSync('Welcome to our restaurant')}</p>
    </div>
  );
}
```

#### Option 2: Using TranslateText component

```jsx
import TranslateText from '../components/TranslateText';

function MyComponent() {
  return (
    <div>
      <TranslateText>
        <h1>Home</h1>
      </TranslateText>
      <TranslateText>
        <p>Welcome to our restaurant</p>
      </TranslateText>
    </div>
  );
}
```

### 5. How Translation Works

1. User selects language from navbar
2. Language change triggers:
   - Updates state in LanguageContext
   - Clears translation cache
3. Components re-render with new language
4. Text is automatically translated via Google API
5. Translations are cached for better performance

### 6. Free Alternative (Without API)

If you don't want to use Google Translate API, the system falls back to hardcoded translations in LanguageContext. The translations dictionary is comprehensive and covers most of the application.

### 7. API Pricing (Google Translate)

- **Free tier**: First 500,000 characters per month
- **After free tier**: $20 per million characters
- **Caching**: Translations are cached to minimize API calls

### 8. Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Click the language selector in navbar (En/አማ/Af)

4. Select a different language

5. Watch as all content automatically translates!

## Troubleshooting

### Translation not working?
- Check if API key is correctly set in `.env`
- Check browser console for errors
- Verify the API is enabled in Google Cloud Console

### Slow translation?
- Translations are cached after first load
- Consider implementing server-side translation
- Use fallback translations in LanguageContext

### API quota exceeded?
- Check your usage in Google Cloud Console
- Implement rate limiting
- Use cached translations more aggressively

## Support

For issues or questions, check:
- [Google Cloud Translation API Docs](https://cloud.google.com/translate/docs)
- Browser developer console for errors
- API usage dashboard in Google Cloud Console
