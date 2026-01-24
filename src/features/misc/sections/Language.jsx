import { useState, useMemo } from 'react';
import { useT, useTranslation } from 'contexts/TranslationContext';

import { MdOutlineOpenInNew, MdSearch, MdComputer } from 'react-icons/md';
import { TextField, InputAdornment } from '@mui/material';

import { Radio } from 'components/Form/Settings';

import languages from '@/i18n/languages.json';

const LanguageOptions = () => {
  const t = useT();
  const { language: currentLanguage, changeLanguage } = useTranslation();
  const languageTitle = t('modals.main.settings.sections.language.title');

  const [searchQuery, setSearchQuery] = useState('');

  // Create language options with both translated and native names
  const languageOptions = useMemo(() => {
    // Convert currentLanguage to ISO format (e.g., "de_DE" -> "de-DE")
    const currentLanguageISO = currentLanguage.replace('_', '-');

    // Use Intl.DisplayNames to get language names in the current language
    const displayNames = new Intl.DisplayNames([currentLanguageISO], { type: 'language' });

    const mappedLanguages = languages.map((lang) => {
      const nativeName = lang.name;

      // Convert language code to ISO format for Intl.DisplayNames
      // e.g., "en_GB" -> "en-GB", "zh_CN" -> "zh-CN"
      const isoCode = lang.value.replace('_', '-');

      let translatedName;
      try {
        translatedName = displayNames.of(isoCode);
        // Simplify by removing country suffixes: "German (Germany)" → "German"
        if (translatedName) {
          translatedName = translatedName.split(' (')[0];
        }
      } catch (e) {
        // Fallback if the code isn't recognized
        translatedName = nativeName;
      }

      // Show native name first, then translated name in brackets (greyed and smaller)
      const displayName = !translatedName || translatedName === nativeName
        ? nativeName
        : (
            <>
              {nativeName}{' '}
              <span style={{ color: '#999', fontSize: '0.85em' }}>({translatedName})</span>
            </>
          );

      return {
        name: displayName,
        value: lang.value,
        nativeName,
        searchText: `${nativeName} ${translatedName || ''}`.toLowerCase(),
      };
    });

    // Sort alphabetically by native name
    return mappedLanguages.sort((a, b) => a.nativeName.localeCompare(b.nativeName));
  }, [currentLanguage]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languageOptions;
    const query = searchQuery.toLowerCase();
    return languageOptions.filter(lang => lang.searchText.includes(query));
  }, [languageOptions, searchQuery]);

  // Detect system language
  const systemLanguage = useMemo(() => {
    const browserLang = navigator.language.replace('-', '_');
    // Check exact match first, then base language
    return languages.find(l => l.value === browserLang) ||
           languages.find(l => l.value.startsWith(browserLang.split('_')[0]));
  }, []);

  // Find current language option for display
  const currentLangOption = languageOptions.find(l => l.value === currentLanguage);

  return (
    <>
      <div className="modalHeader">
        <span className="mainTitle">
          {languageTitle}
        </span>
        <div className="headerActions">
          <a
            className="link"
            href="https://hosted.weblate.org/new-lang/mue/mue-tab/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Add translation
            <MdOutlineOpenInNew />
          </a>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TextField
          placeholder={t('modals.main.settings.sections.language.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch style={{ color: '#888' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '250px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
          }}
        />
        {currentLangOption && (
          <div style={{ color: '#888', whiteSpace: 'nowrap' }}>
            {t('modals.main.settings.sections.language.current')}: <strong style={{ color: 'var(--fg)' }}>{currentLangOption.nativeName}</strong>
          </div>
        )}
      </div>
      {systemLanguage && systemLanguage.value !== currentLanguage && (
        <button
          onClick={() => changeLanguage(systemLanguage.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'var(--fg)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <MdComputer style={{ fontSize: '18px', opacity: 0.8 }} />
          {t('modals.main.settings.sections.language.use_system')}
          <span style={{ opacity: 0.6 }}>({systemLanguage.name})</span>
        </button>
      )}
      <div className="languageSettings">
        <Radio name="language" options={filteredLanguages} element=".other" />
      </div>
    </>
  );
};

export { LanguageOptions as default, LanguageOptions };
