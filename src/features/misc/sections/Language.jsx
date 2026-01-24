import { useState, useEffect, useRef, useMemo } from 'react';
import { useT, useTranslation } from 'contexts/TranslationContext';
import variables from 'config/variables';

import { MdOutlineOpenInNew } from 'react-icons/md';

import { Radio } from 'components/Form/Settings';

import languages from '@/i18n/languages.json';

const LanguageOptions = () => {
  const t = useT();
  const { language: currentLanguage } = useTranslation();
  const loadingText = t('modals.main.loading');
  const offlineText = t('modals.main.marketplace.offline.description');
  const languageTitle = t('modals.main.settings.sections.language.title');
  const quoteTitle = t('modals.main.settings.sections.language.quote');

  // Create language options with both translated and native names
  const languageOptions = useMemo(() => {
    // Convert currentLanguage to ISO format (e.g., "de_DE" -> "de-DE")
    const currentLanguageISO = currentLanguage.replace('_', '-');

    // Use Intl.DisplayNames to get language names in the current language
    const displayNames = new Intl.DisplayNames([currentLanguageISO], { type: 'language' });

    return languages.map((lang) => {
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
      };
    });
  }, [currentLanguage]);

  const [quoteLanguages, setQuoteLanguages] = useState([
    {
      name: loadingText,
      value: 'loading',
    },
  ]);

  const controllerRef = useRef(new AbortController());

  const getquoteLanguages = async () => {
    try {
      const data = await (
        await fetch(variables.constants.API_URL + '/quotes/languages', {
          signal: controllerRef.current.signal,
        })
      ).json();

      if (controllerRef.current.signal.aborted === true) {
        return;
      }

      const fetchedQuoteLanguages = data.map((language) => {
        return {
          name: languages.find((l) => l.value === language.name)
            ? languages.find((l) => l.value === language.name).name
            : 'English',
          value: language,
        };
      });

      setQuoteLanguages(fetchedQuoteLanguages);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch quote languages:', error);
      }
    }
  };

  useEffect(() => {
    if (navigator.onLine === false || localStorage.getItem('offlineMode') === 'true') {
      setQuoteLanguages([
        {
          name: offlineText,
          value: 'loading',
        },
      ]);
      return;
    }

    getquoteLanguages();

    const controller = controllerRef.current;
    return () => {
      // stop making requests
      controller.abort();
    };
  }, [offlineText]);

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
      <div className="languageSettings">
        <Radio name="language" options={languageOptions} element=".other" />
      </div>
      <span className="mainTitle">
        {quoteTitle}
      </span>
      <div className="languageSettings">
        <Radio
          name="quoteLanguage"
          options={quoteLanguages.map((language) => {
            return { name: language.name, value: language.value.name };
          })}
          defaultValue={quoteLanguages[0].name}
          category="quote"
        />
      </div>
    </>
  );
};

export { LanguageOptions as default, LanguageOptions };
