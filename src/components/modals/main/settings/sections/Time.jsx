import variables from 'modules/variables';
import { PureComponent } from 'react';

import Header from '../Header';
import Checkbox from '../Checkbox';
import Dropdown from '../Dropdown';
import Radio from '../Radio';
//import Slider from '../Slider';
//import Switch from '../Switch';

import SettingsItem from '../SettingsItem';

//import { values } from 'modules/helpers/settings/modals';

export default class TimeSettings extends PureComponent {
  constructor() {
    super();
    this.state = {
      timeType: localStorage.getItem('timeType') || 'digital',
      hourColour: localStorage.getItem('hourColour') || '#fff',
      minuteColour: localStorage.getItem('minuteColour') || '#fff',
    };
  }

  updateHourColour(event) {
    const hourColour = event.target.value;
    this.setState({ hourColour });
    localStorage.setItem('hourColour', hourColour);
  }

  updateMinuteColour(event) {
    const minuteColour = event.target.value;
    this.setState({ minuteColour });
    localStorage.setItem('minuteColour', minuteColour);
  }

  resetHourColour() {
    localStorage.setItem('hourColour', '#fff')
  }

  resetMinuteColour() {
    localStorage.setItem('minuteColour', '#fff')
  }



  render() {
    const getMessage = (text) => variables.language.getMessage(variables.languagecode, text);

    let timeSettings = null;

    const digitalSettings = (
      <SettingsItem
        title={getMessage('modals.main.settings.sections.time.digital.title')}
        subtitle={getMessage('modals.main.settings.sections.time.digital.subtitle')}
        final={true}
      >
        <Radio
          name="timeformat"
          options={[
            {
              name: getMessage('modals.main.settings.sections.time.digital.twentyfourhour'),
              value: 'twentyfourhour',
            },
            {
              name: getMessage('modals.main.settings.sections.time.digital.twelvehour'),
              value: 'twelvehour',
            },
          ]}
          smallTitle={true}
          category="clock"
        />
        <Checkbox
          name="seconds"
          text={getMessage('modals.main.settings.sections.time.digital.seconds')}
          category="clock"
        />
        <Checkbox
          name="zero"
          text={getMessage('modals.main.settings.sections.time.digital.zero')}
          category="clock"
        />
      </SettingsItem>
    );

    const analogSettings = (
      <SettingsItem
        title={getMessage('modals.main.settings.sections.time.analogue.title')}
        subtitle={getMessage('modals.main.settings.sections.time.analogue.subtitle')}
        final={true}
      >
        <Checkbox
          name="secondHand"
          text={getMessage('modals.main.settings.sections.time.analogue.second_hand')}
          category="clock"
        />
        <Checkbox
          name="minuteHand"
          text={getMessage('modals.main.settings.sections.time.analogue.minute_hand')}
          category="clock"
        />
        <Checkbox
          name="hourHand"
          text={getMessage('modals.main.settings.sections.time.analogue.hour_hand')}
          category="clock"
        />
        <Checkbox
          name="hourMarks"
          text={getMessage('modals.main.settings.sections.time.analogue.hour_marks')}
          category="clock"
        />
        <Checkbox
          name="minuteMarks"
          text={getMessage('modals.main.settings.sections.time.analogue.minute_marks')}
          category="clock"
        />
      </SettingsItem>
    );

    const verticalClock = (
      <>
        <SettingsItem title="Change minute text hour colour" subtitle="">
          <div className="colourInput">
            <input
              type="color"
              name="minuteColour"
              className="minuteColour"
              onChange={(event) => this.updateHourColour(event)}
              value={this.state.hourColour}
            ></input>
            <label htmlFor={'hourColour'} className="customBackgroundHex">
              {this.state.hourColour}
            </label>
          </div>
          <span className="link" onClick={() => this.resetHourColour()}>
            {getMessage('modals.main.settings.buttons.reset')}
          </span>
        </SettingsItem>
        <SettingsItem title="Change minute text minute colour" subtitle="">
          <div className="colourInput">
            <input
              type="color"
              name="minuteColour"
              className="minuteColour"
              onChange={(event) => this.updateMinuteColour(event)}
              value={this.state.minuteColour}
            ></input>
            <label htmlFor={'minuteColour'} className="customBackgroundHex">
              {this.state.minuteColour}
            </label>
          </div>
          <span className="link" onClick={() => this.resetMinuteColour()}>
            {getMessage('modals.main.settings.buttons.reset')}
          </span>
        </SettingsItem>
        {digitalSettings}
      </>
    );

    if (this.state.timeType === 'digital') {
      timeSettings = digitalSettings;
    } else if (this.state.timeType === 'analogue') {
      timeSettings = analogSettings;
    } else if (this.state.timeType === 'verticalClock') {
      timeSettings = verticalClock;
    }

    return (
      <>
        <Header
          title={getMessage('modals.main.settings.sections.time.title')}
          setting="time"
          category="clock"
          element=".clock-container"
          zoomSetting="zoomClock"
          switch={true}
        />
        <SettingsItem
          title={getMessage('modals.main.settings.sections.time.type')}
          subtitle={getMessage('modals.main.settings.sections.time.type_subtitle')}
          final={this.state.timeType === 'percentageComplete'}
        >
          <Dropdown
            name="timeType"
            onChange={(value) => this.setState({ timeType: value })}
            category="clock"
          >
            <option value="digital">
              {getMessage('modals.main.settings.sections.time.digital.title')}
            </option>
            <option value="analogue">
              {getMessage('modals.main.settings.sections.time.analogue.title')}
            </option>
            <option value="percentageComplete">
              {getMessage('modals.main.settings.sections.time.percentage_complete')}
            </option>
            <option value="verticalClock">Vertical Clock</option>
          </Dropdown>
        </SettingsItem>
        {timeSettings}
      </>
    );
  }
}
