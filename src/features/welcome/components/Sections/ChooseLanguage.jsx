import variables from 'config/variables';
import { MdOutlineOpenInNew } from 'react-icons/md';
import languages from '@/i18n/languages.json';
import { useMessage } from 'contexts/TranslationContext';

import { Radio } from 'components/Form/Settings';
import { Header, Content } from '../Layout';

function ChooseLanguage() {
  const title = useMessage('modals.welcome.sections.language.title');
  const description = useMessage('modals.welcome.sections.language.description');

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
        <Radio name="language" options={languages} category="welcomeLanguage" />
      </div>
    </Content>
  );
}

export { ChooseLanguage as default, ChooseLanguage };
