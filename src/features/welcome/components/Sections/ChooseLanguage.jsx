import { useState, useMemo } from 'react';
import { MdOutlineOpenInNew, MdSearch } from 'react-icons/md';
import { TextField, InputAdornment } from '@mui/material';
import languages from '@/i18n/languages.json';
import { useT, useTranslation } from 'contexts/TranslationContext';
import variables from 'config/variables';

import { Radio } from 'components/Form/Settings';
import { Header, Content } from '../Layout';

function ChooseLanguage() {
  const t = useT();
  const { language: currentLanguage, changeLanguage } = useTranslation();
  const title = t('modals.welcome.sections.language.title');
  const description = t('modals.welcome.sections.language.description');

  const [searchQuery, setSearchQuery] = useState('');

  const languageOptions = useMemo(() => {
    const currentLanguageISO = currentLanguage.replace('_', '-');
    const displayNames = new Intl.DisplayNames([currentLanguageISO], { type: 'language' });

    const mappedLanguages = languages.map((lang) => {
      const nativeName = lang.name;
      const isoCode = lang.value.replace('_', '-');

      let translatedName;
      try {
        translatedName = displayNames.of(isoCode);
        if (translatedName) {
          translatedName = translatedName.split(' (')[0];
        }
      } catch (e) {
        translatedName = nativeName;
      }

      const displayName =
        !translatedName || translatedName === nativeName ? (
          nativeName
        ) : (
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
    return languages.find(l => l.value === browserLang) ||
           languages.find(l => l.value.startsWith(browserLang.split('_')[0]));
  }, []);

  return (
    <Content>
      <Header
        title={title}
        subtitle={
          <>
            {description}{' '}
            <a
              href={variables.constants.TRANSLATIONS_URL}
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2em' }}
            >
              GitHub <MdOutlineOpenInNew />
            </a>
          </>
        }
      />
      {systemLanguage && systemLanguage.value !== currentLanguage && (
        <button
          className="uploadbg"
          onClick={() => changeLanguage(systemLanguage.value)}
          style={{ marginBottom: 12 }}
        >
          {t('modals.main.settings.sections.language.use_system')} ({systemLanguage.name})
        </button>
      )}
      <TextField
        placeholder={t('modals.main.settings.sections.language.search')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MdSearch style={{ color: '#888' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          marginBottom: 2,
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
      <div className="languageSettings">
        <Radio name="language" options={filteredLanguages} category="welcomeLanguage" />
      </div>
    </Content>
  );
}

export { ChooseLanguage as default, ChooseLanguage };
