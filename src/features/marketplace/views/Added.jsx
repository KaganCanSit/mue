import variables from 'config/variables';
import { PureComponent } from 'react';
import { MdUpdate, MdOutlineExtensionOff, MdSendTimeExtension } from 'react-icons/md';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

import { SideloadFailedModal } from '../components/Elements/SideloadFailedModal/SideloadFailedModal';
import ItemPage from './ItemPage';
import Items from '../components/Items/Items';
import { Dropdown, FileUpload } from 'components/Form/Settings';
import { Header, CustomActions } from 'components/Layout/Settings';
import { Button } from 'components/Elements';

import { install, uninstall, urlParser } from 'utils/marketplace';

export default class Added extends PureComponent {
  constructor() {
    super();
    this.state = {
      installed: JSON.parse(localStorage.getItem('installed')),
      item: {},
      button: '',
      showFailed: false,
      failedReason: '',
    };
    this.buttons = {
      uninstall: (
        <Button
          type="settings"
          onClick={() => this.uninstall()}
          label={variables.getMessage('modals.main.marketplace.product.buttons.remove')}
        />
      ),
    };
  }

  installAddon(input) {
    let failedReason = '';
    if (!input.name) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.no_name');
    } else if (!input.author) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.no_author');
    } else if (!input.type) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.no_type');
    } else if (!input.version) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.no_version');
    } else if (
      input.type === 'photos' &&
      (!input.photos ||
        !input.photos.length ||
        !input.photos[0].url ||
        !input.photos[0].url.default ||
        !input.photos[0].photographer ||
        !input.photos[0].location)
    ) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.invalid_photos');
    } else if (
      input.type === 'quotes' &&
      (!input.quotes || !input.quotes.length || !input.quotes[0].quote || !input.quotes[0].author)
    ) {
      failedReason = variables.getMessage('modals.main.addons.sideload.errors.invalid_quotes');
    }

    if (failedReason !== '' && this.state.showFailed === false) {
      return this.setState({
        failedReason,
        showFailed: true,
      });
    }

    install(input.type, input, true, false);
    toast(variables.getMessage('toasts.installed'));
    variables.stats.postEvent('marketplace', 'Sideload');
    this.setState({
      installed: JSON.parse(localStorage.getItem('installed')),
    });
  }

  getSideloadButton() {
    return (
      <Button
        type="settings"
        onClick={() => document.getElementById('file-input').click()}
        ref={this.customDnd}
        icon={<MdSendTimeExtension />}
        label={variables.getMessage('modals.main.addons.sideload.title')}
      />
    );
  }

  toggle(type, data) {
    if (type === 'item') {
      const installed = JSON.parse(localStorage.getItem('installed'));
      const info = {
        data: installed.find((i) => i.name === data.name),
      };

      this.setState({
        item: {
          type: info.data.type,
          display_name: info.data.name,
          author: info.data.author,
          description: urlParser(info.data.description.replace(/\n/g, '<br>')),
          //updated: info.updated,
          version: info.data.version,
          icon: info.data.screenshot_url,
          data: info.data,
        },
        button: this.buttons.uninstall,
      });
      variables.stats.postEvent('marketplace', 'ItemPage viewed');
    } else {
      this.setState({
        item: {},
      });
    }
  }

  uninstall() {
    uninstall(this.state.item.type, this.state.item.display_name);

    toast(variables.getMessage('toasts.uninstalled'));

    this.setState({
      button: '',
      installed: JSON.parse(localStorage.getItem('installed')),
      item: {},
    });

    variables.stats.postEvent('marketplace', 'Uninstall');
  }

  sortAddons(value, sendEvent) {
    let installed = JSON.parse(localStorage.getItem('installed'));
    switch (value) {
      case 'newest':
        installed.reverse();
        break;
      case 'oldest':
        break;
      case 'a-z':
        installed.sort((a, b) => {
          if (a.display_name < b.display_name) {
            return -1;
          }
          if (a.display_name > b.display_name) {
            return 1;
          }
          return 0;
        });
        break;
      case 'z-a':
        installed.sort();
        installed.reverse();
        break;
      default:
        break;
    }

    this.setState({
      installed,
    });

    if (sendEvent) {
      variables.stats.postEvent('marketplace', 'Sort');
    }
  }

  updateCheck() {
    let updates = 0;
    this.state.installed.forEach(async (item) => {
      const data = await (
        await fetch(variables.constants.API_URL + 'marketplace/item/' + item.name)
      ).json();
      if (data.version !== item.version) {
        updates++;
      }
    });

    if (updates > 0) {
      toast(
        variables.getMessage('modals.main.addons.updates_available', {
          amount: updates,
        }),
      );
    } else {
      toast(variables.getMessage('modals.main.addons.no_updates'));
    }
  }

  removeAll() {
    try {
      this.state.installed.forEach((item) => {
        uninstall(item.type, item.name);
      });
    } catch (e) {}

    localStorage.setItem('installed', JSON.stringify([]));

    toast(variables.getMessage('toasts.uninstalled_all'));

    this.setState({
      installed: [],
    });

    this.forceUpdate();
  }

  componentDidMount() {
    this.sortAddons(localStorage.getItem('sortAddons'), false);
  }

  render() {
    const sideLoadBackendElements = () => (
      <>
        <Modal
          closeTimeoutMS={100}
          onRequestClose={() => this.setState({ showFailed: false })}
          isOpen={this.state.showFailed}
          className="Modal resetmodal mainModal resetmodal"
          overlayClassName="Overlay resetoverlay"
          ariaHideApp={false}
        >
          <SideloadFailedModal
            modalClose={() => this.setState({ showFailed: false })}
            reason={this.state.failedReason}
          />
        </Modal>
        <FileUpload
          id="file-input"
          type="settings"
          accept="application/json"
          loadFunction={(e) => this.installAddon(JSON.parse(e))}
        />
      </>
    );

    if (this.state.installed.length === 0) {
      return (
        <>
          <Header title={variables.getMessage('modals.main.navbar.addons')} report={false}>
            <CustomActions>{this.getSideloadButton()}</CustomActions>
          </Header>
          {sideLoadBackendElements()}
          <div className="emptyItems">
            <div className="emptyNewMessage">
              <MdOutlineExtensionOff />
              <span className="title">
                {variables.getMessage('modals.main.addons.empty.title')}
              </span>
              <span className="subtitle">
                {variables.getMessage('modals.main.addons.empty.description')}
              </span>
            </div>
          </div>
        </>
      );
    }

    if (this.state.item.display_name) {
      return (
        <ItemPage
          data={this.state.item}
          button={this.state.button}
          addons={true}
          toggleFunction={() => this.toggle()}
        />
      );
    }

    return (
      <>
        <Header title={variables.getMessage('modals.main.addons.added')} report={false}>
          <CustomActions>
            {this.getSideloadButton()}
            {sideLoadBackendElements()}
            <Button
              type="settings"
              onClick={() => this.updateCheck()}
              icon={<MdUpdate />}
              label={variables.getMessage('modals.main.addons.check_updates')}
            />
            <Button
              type="settings"
              onClick={() => this.removeAll()}
              icon={<MdOutlineExtensionOff />}
              label="Remove all addons"
            />
            {/*<Button
                type="settings"
                onClick={() => document.getElementById('file-input').click()}
                icon={<MdSendTimeExtension />}
                label={variables.getMessage('modals.main.addons.sideload.title')}
    `       />*/}
          </CustomActions>
        </Header>
        <Dropdown
          label={variables.getMessage('modals.main.addons.sort.title')}
          name="sortAddons"
          onChange={(value) => this.sortAddons(value)}
          items={[
            {
              value: 'newest',
              text: variables.getMessage('modals.main.addons.sort.newest'),
            },
            {
              value: 'oldest',
              text: variables.getMessage('modals.main.addons.sort.oldest'),
            },
            {
              value: 'a-z',
              text: variables.getMessage('modals.main.addons.sort.a_z'),
            },
            {
              value: 'z-a',
              text: variables.getMessage('modals.main.addons.sort.z_a'),
            },
          ]}
        />
        <Items
          items={this.state.installed}
          isAdded={true}
          filter=""
          toggleFunction={(input) => this.toggle('item', input)}
          showCreateYourOwn={false}
        />
      </>
    );
  }
}
