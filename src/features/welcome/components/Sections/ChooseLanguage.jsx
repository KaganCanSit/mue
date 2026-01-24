import { useMemo } from 'react';
import { MdOutlineOpenInNew } from 'react-icons/md';
import languages from '@/i18n/languages.json';
import { useT, useTranslation } from 'contexts/TranslationContext';
import variables from 'config/variables';

import { Radio } from 'components/Form/Settings';
import { Header, Content } from '../Layout';

function ChooseLanguage() {
  const t = useT();
  const { language: currentLanguage } = useTranslation();
  const title = t('modals.welcome.sections.language.title');
  const description = t('modals.welcome.sections.language.description');

  const languageOptions = useMemo(() => {
    const currentLanguageISO = currentLanguage.replace('_', '-');
    const displayNames = new Intl.DisplayNames([currentLanguageISO], { type: 'language' });

    return languages.map((lang) => {
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
      };
    });
  }, [currentLanguage]);

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
      <div className="languageSettings">
        <Radio name="language" options={languageOptions} category="welcomeLanguage" />
      </div>
    </Content>
  );
}

export { ChooseLanguage as default, ChooseLanguage };
