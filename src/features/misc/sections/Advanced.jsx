import variables from 'config/variables';
import { useState } from 'react';
import Modal from 'react-modal';
import {
  MdUpload as ImportIcon,
  MdDownload as ExportIcon,
  MdRestartAlt as ResetIcon,
  MdDataUsage,
  MdError,
} from 'react-icons/md';

import { exportSettings, importSettings } from 'utils/settings';

import { FileUpload, Text, Switch, Dropdown } from 'components/Form/Settings';
import { ResetModal, Button } from 'components/Elements';

import { Header, Section, Row, Content, Action } from 'components/Layout/Settings';

import time_zones from 'features/time/timezones.json';

function AdvancedOptions() {
  const [resetModal, setResetModal] = useState(false);
  const [data, setData] = useState(false);
  const ADVANCED_SECTION = 'modals.main.settings.sections.advanced';

  const Data = () => {
    return localStorage.getItem('welcomePreview') !== 'true' ? (
      <Row final={true}>
        <Content
          title={variables.getMessage('modals.main.settings.sections.advanced.data')}
          subtitle={variables.getMessage('modals.main.settings.sections.advanced.data_description')}
        />
        <div className="resetDataButtonsLayout">
          <Button
            onClick={() => setResetModal(true)}
            icon={<ResetIcon />}
            label={variables.getMessage('modals.main.settings.buttons.reset')}
          />
          <Button
            onClick={() => exportSettings()}
            icon={<ExportIcon />}
            label={variables.getMessage('modals.main.settings.buttons.export')}
          />
          <Button
            onClick={() => document.getElementById('file-input').click()}
            icon={<ImportIcon />}
            label={variables.getMessage('modals.main.settings.buttons.import')}
          />
        </div>
        <FileUpload
          id="file-input"
          accept="application/json"
          type="settings"
          loadFunction={(e) => importSettings(e)}
        />
      </Row>
    ) : (
      <div className="emptyItems">
        <div className="emptyMessage">
          <div className="loaderHolder">
            <MdError />

            <span className="title">
              {variables.getMessage(
                'modals.main.settings.sections.advanced.preview_data_disabled.title',
              )}
            </span>
            <span className="subtitle">
              {variables.getMessage(
                'modals.main.settings.sections.advanced.preview_data_disabled.description',
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  let header;
  if (data) {
    header = (
      <Header
        title={variables.getMessage(`${ADVANCED_SECTION}.title`)}
        secondaryTitle={variables.getMessage(`${ADVANCED_SECTION}.data`)}
        goBack={() => setData(false)}
        report={false}
      />
    );
  } else {
    header = <Header title={variables.getMessage(`${ADVANCED_SECTION}.title`)} report={false} />;
  }

  return (
    <>
      {header}
      {data ? (
        <>
          <Data />
          <Modal
            closeTimeoutMS={100}
            onRequestClose={() => setResetModal(false)}
            isOpen={resetModal}
            className="Modal resetmodal mainModal"
            overlayClassName="Overlay resetoverlay"
            ariaHideApp={false}
          >
            <ResetModal modalClose={() => setResetModal(false)} />
          </Modal>
        </>
      ) : (
        <>
          <Section
            title={variables.getMessage(`${ADVANCED_SECTION}.data`)}
            subtitle={variables.getMessage(`${ADVANCED_SECTION}.data_subtitle`)}
            onClick={() => setData(true)}
            icon={<MdDataUsage />}
          />
          <Row>
            <Content
              title={variables.getMessage('modals.main.settings.sections.advanced.offline_mode')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.advanced.offline_subtitle',
              )}
            />
            <Action>
              <Switch name="offlineMode" element=".other" />
            </Action>
          </Row>

          <Row>
            <Content
              title={variables.getMessage('modals.main.settings.sections.advanced.timezone.title')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.advanced.timezone.subtitle',
              )}
            />
            <Action>
              <Dropdown
                name="timezone"
                category="timezone"
                items={[
                  {
                    value: 'auto',
                    text: variables.getMessage(
                      'modals.main.settings.sections.advanced.timezone.automatic',
                    ),
                  },
                  ...time_zones.map((timezone) => ({ value: timezone, text: timezone })),
                ]}
              />
            </Action>
          </Row>
          <Row>
            <Content
              title={variables.getMessage('modals.main.settings.sections.advanced.tab_name')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.advanced.tab_name_subtitle',
              )}
            />
            <Action>
              <Text name="tabName" default={variables.getMessage('tabname')} category="other" />
            </Action>
          </Row>
          <Row>
            <Content
              title={variables.getMessage('modals.main.settings.sections.advanced.custom_css')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.advanced.custom_css_subtitle',
              )}
            />
            <Action>
              <Text name="customcss" textarea={true} category="other" customcss={true} />
            </Action>
          </Row>
          <Row final={true}>
            <Content
              title={variables.getMessage('modals.main.settings.sections.experimental.title')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.advanced.experimental_warning',
              )}
            />
            <Action>
              <Switch
                name="experimental"
                text={variables.getMessage('modals.main.settings.enabled')}
                element=".other"
              />
            </Action>
          </Row>
        </>
      )}
    </>
  );
}

export { AdvancedOptions as default, AdvancedOptions };
