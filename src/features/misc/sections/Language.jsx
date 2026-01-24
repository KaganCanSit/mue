import variables from 'config/variables';
import { useState, useEffect, useRef } from 'react';
import { useMessage } from 'contexts/TranslationContext';

import { MdOutlineOpenInNew } from 'react-icons/md';

import { Radio } from 'components/Form/Settings';

import languages from '@/i18n/languages.json';

const LanguageOptions = () => {
  const loadingText = useMessage('modals.main.loading');
  const offlineText = useMessage('modals.main.marketplace.offline.description');
  const languageTitle = useMessage('modals.main.settings.sections.language.title');
  const quoteTitle = useMessage('modals.main.settings.sections.language.quote');

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
        <Radio name="language" options={languages} element=".other" />
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
