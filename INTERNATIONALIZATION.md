# Internationalization (i18n) Guide

This application now supports internationalization with English and Brazilian Portuguese languages.

## Features

- **Language Detection**: Automatically detects the user's preferred language
- **Language Switching**: Users can switch between English and Portuguese using the language switcher
- **Persistent Language**: Language preference is saved in localStorage
- **Fallback**: Falls back to English if a translation is missing

## Supported Languages

- **English (en)**: Default language
- **Brazilian Portuguese (pt-BR)**: Full translation support

## How to Use

### For Users

1. **Language Switcher**: Located in the top-right corner of the application
2. **Automatic Detection**: The app will automatically detect your browser's language
3. **Persistent**: Your language choice is remembered across sessions

### For Developers

#### Adding New Text

1. **Add to English translations** (`src/i18n/locales/en.json`):
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New description"
  }
}
```

2. **Add to Portuguese translations** (`src/i18n/locales/pt-BR.json`):
```json
{
  "newSection": {
    "title": "Novo Título",
    "description": "Nova descrição"
  }
}
```

3. **Use in components**:
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newSection.title')}</h1>
      <p>{t('newSection.description')}</p>
    </div>
  );
};
```

#### Adding New Languages

1. **Create new locale file** (`src/i18n/locales/ja.json`):
```json
{
  "app": {
    "title": "ダーツスコアマネージャー"
  }
}
```

2. **Update i18n configuration** (`src/i18n/index.ts`):
```typescript
import ja from './locales/ja.json';

const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
  ja: { translation: ja }, // Add new language
};
```

3. **Update LanguageSwitcher** (`src/components/LanguageSwitcher.tsx`):
```tsx
<button
  className={`lang-btn ${currentLanguage === 'ja' ? 'active' : ''}`}
  onClick={() => changeLanguage('ja')}
  aria-label="日本語に切り替え"
  title="日本語"
>
  🇯🇵 JA
</button>
```

#### Interpolation

For dynamic values, use interpolation:

```json
{
  "welcome": "Welcome, {{name}}!",
  "score": "Score: {{score}}/{{total}}"
}
```

```tsx
const { t } = useTranslation();

// Basic interpolation
t('welcome', { name: 'John' }) // "Welcome, John!"

// Multiple values
t('score', { score: 150, total: 501 }) // "Score: 150/501"
```

#### Pluralization

For plural forms:

```json
{
  "players": "{{count}} player",
  "players_plural": "{{count}} players"
}
```

```tsx
t('players', { count: 1 }) // "1 player"
t('players', { count: 5 }) // "5 players"
```

## File Structure

```
src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       └── pt-BR.json        # Brazilian Portuguese translations
├── hooks/
│   └── useI18n.ts           # Custom i18n hook
└── components/
    └── LanguageSwitcher.tsx  # Language switcher component
```

## Best Practices

1. **Use translation keys**: Always use descriptive keys like `game.setup.startingScore` instead of generic ones
2. **Group related translations**: Organize translations in logical groups (app, game, errors, etc.)
3. **Keep translations consistent**: Use the same terminology across the application
4. **Test both languages**: Always test your changes in both languages
5. **Use interpolation**: Avoid hardcoding values in translation strings

## Troubleshooting

### Translation not showing
- Check if the translation key exists in both language files
- Verify the key path is correct
- Check browser console for missing translation warnings

### Language not switching
- Ensure the language switcher is properly imported
- Check if the language code matches the resource keys
- Verify localStorage is not blocked

### Performance issues
- Translations are loaded lazily
- Language detection only runs once on app start
- Consider code splitting for large translation files

## Contributing

When adding new features:

1. **Add English text first** to `en.json`
2. **Add Portuguese translation** to `pt-BR.json`
3. **Update components** to use translation keys
4. **Test both languages** to ensure consistency
5. **Update this documentation** if adding new language features
