import variables from 'config/variables';
import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  MdCancel,
  MdAddLink,
  MdAddPhotoAlternate,
  MdPersonalVideo,
  MdOutlineFileUpload,
  MdFolder,
} from 'react-icons/md';
import EventBus from 'utils/eventbus';
import { compressAccurately, filetoDataURL } from 'image-conversion';
import videoCheck from '../api/videoCheck';
import {
  getAllBackgrounds,
  addBackground,
  updateBackground,
  deleteBackground,
  clearAllBackgrounds,
  migrateFromLocalStorage,
} from 'utils/customBackgroundDB';

import { Checkbox, FileUpload } from 'components/Form/Settings';
import { Tooltip, Button } from 'components/Elements';
import Modal from 'react-modal';

import CustomURLModal from './CustomURLModal';

const CustomSettings = memo(() => {
  const [customBackground, setCustomBackground] = useState([]);
  const [customURLModal, setCustomURLModal] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const customDnd = useRef(null);

  // Load backgrounds from IndexedDB on mount
  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        // Try migration first
        await migrateFromLocalStorage();

        // Load from IndexedDB
        const backgrounds = await getAllBackgrounds();
        setCustomBackground(backgrounds);
      } catch (error) {
        console.error('Error loading backgrounds:', error);
        toast(variables.getMessage('toasts.error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadBackgrounds();
  }, []);

  const handleCustomBackground = useCallback(
    async (e, index) => {
      const result = e.target.result;

      try {
        // Update or add to IndexedDB
        if (index < customBackground.length) {
          await updateBackground(index, result);
        } else {
          await addBackground(result);
        }

        // Reload from IndexedDB to get the latest state
        const backgrounds = await getAllBackgrounds();
        setCustomBackground(backgrounds);

        // Store count in localStorage for backward compatibility
        try {
          localStorage.setItem('customBackground', JSON.stringify(backgrounds));
        } catch (_quotaError) {
          // If quota exceeded, just store the count
          console.warn('localStorage quota exceeded, storing count only');
          localStorage.setItem('customBackgroundCount', backgrounds.length.toString());
        }

        const reminderInfo = document.querySelector('.reminder-info');
        if (reminderInfo) {
          reminderInfo.style.display = 'flex';
        }
        localStorage.setItem('showReminder', true);
        EventBus.emit('refresh', 'background');
      } catch (error) {
        console.error('Error saving background:', error);
        toast(variables.getMessage('toasts.error'));
      }
    },
    [customBackground.length],
  );

  const modifyCustomBackground = useCallback(async (type, index) => {
    try {
      if (type === 'add') {
        await addBackground('');
      } else {
        await deleteBackground(index);
      }

      // Reload from IndexedDB to get the latest state
      const backgrounds = await getAllBackgrounds();
      setCustomBackground(backgrounds);

      // Store in localStorage with quota handling
      try {
        localStorage.setItem('customBackground', JSON.stringify(backgrounds));
      } catch (_quotaError) {
        console.warn('localStorage quota exceeded, storing count only');
        localStorage.setItem('customBackgroundCount', backgrounds.length.toString());
      }

      const reminderInfo = document.querySelector('.reminder-info');
      if (reminderInfo) {
        reminderInfo.style.display = 'flex';
      }
      localStorage.setItem('showReminder', true);
      EventBus.emit('refresh', 'background');
    } catch (error) {
      console.error('Error modifying background:', error);
      toast(variables.getMessage('toasts.error'));
    }
  }, []);

  const uploadCustomBackground = useCallback(() => {
    const newIndex = customBackground.length;
    document.getElementById('bg-input').setAttribute('index', newIndex);
    document.getElementById('bg-input').click();
    setCurrentBackgroundIndex(newIndex);
  }, [customBackground.length]);

  const addCustomURL = useCallback(
    async (e) => {
      // regex: https://ihateregex.io/expr/url/
      const urlRegex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b([-a-zA-Z0-9()!@:%_.~#?&=]*)/;
      if (urlRegex.test(e) === false) {
        return setUrlError(variables.getMessage('widgets.quicklinks.url_error'));
      }

      const newIndex = customBackground.length;
      setCustomURLModal(false);
      setCurrentBackgroundIndex(newIndex);
      await handleCustomBackground({ target: { result: e } }, newIndex);
    },
    [customBackground.length, handleCustomBackground],
  );

  useEffect(() => {
    const dnd = customDnd.current;
    if (!dnd) return;

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const settings = {};

      Object.keys(localStorage).forEach((key) => {
        settings[key] = localStorage.getItem(key);
      });

      const settingsSize = new TextEncoder().encode(JSON.stringify(settings)).length;

      // Process each dropped file
      files.forEach((file, index) => {
        const fileIndex = customBackground.length + index;

        if (videoCheck(file.type) === true) {
          if (settingsSize + file.size > 4850000) {
            return toast(variables.getMessage('toasts.no_storage'));
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            handleCustomBackground({ target: { result: reader.result } }, fileIndex);
          };
          reader.readAsDataURL(file);
        } else {
          // Handle image files
          compressAccurately(file, {
            size: 450,
            accuracy: 0.9,
          })
            .then(async (res) => {
              if (settingsSize + res.size > 4850000) {
                return toast(variables.getMessage('toasts.no_storage'));
              }

              handleCustomBackground(
                {
                  target: {
                    result: await filetoDataURL(res),
                  },
                },
                fileIndex,
              );
            })
            .catch((error) => {
              console.error('Error compressing image:', error);
              toast(variables.getMessage('toasts.error'));
            });
        }
      });
    };

    dnd.ondragover = handleDragOver;
    dnd.ondragenter = handleDragOver;
    dnd.ondrop = handleDrop;

    return () => {
      if (dnd) {
        dnd.ondragover = null;
        dnd.ondragenter = null;
        dnd.ondrop = null;
      }
    };
  }, [customBackground.length, handleCustomBackground]);

  const hasVideo = customBackground.filter((bg) => bg && videoCheck(bg)).length > 0;

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <span>{variables.getMessage('modals.main.loading')}</span>
      </div>
    );
  }

  return (
    <>
      <div className="dropzone" ref={customDnd}>
        <div className="imagesTopBar">
          <div>
            <MdAddPhotoAlternate />
            <div>
              <span className="title">
                {variables.getMessage(
                  'modals.main.settings.sections.background.source.custom_title',
                )}
              </span>
              <span className="subtitle">
                {variables.getMessage(
                  'modals.main.settings.sections.background.source.custom_description',
                )}
              </span>
            </div>
          </div>
          <div className="topbarbuttons">
            <Button
              type="settings"
              onClick={uploadCustomBackground}
              icon={<MdOutlineFileUpload />}
              label={variables.getMessage('modals.main.settings.sections.background.source.upload')}
            />
            <Button
              type="settings"
              onClick={() => setCustomURLModal(true)}
              icon={<MdAddLink />}
              label={variables.getMessage(
                'modals.main.settings.sections.background.source.add_url',
              )}
            />
          </div>
        </div>
        <div className="dropzone-content">
          {customBackground.length > 0 ? (
            <div className="images-row">
              {customBackground.map((url, index) => (
                <div key={index}>
                  {url && !videoCheck(url) ? (
                    <img alt={'Custom background ' + (index || 0)} src={customBackground[index]} />
                  ) : url && videoCheck(url) ? (
                    <MdPersonalVideo className="customvideoicon" />
                  ) : null}
                  {customBackground.length > 0 && (
                    <Tooltip
                      title={variables.getMessage(
                        'modals.main.settings.sections.background.source.remove',
                      )}
                    >
                      <Button
                        type="settings"
                        onClick={() => modifyCustomBackground('remove', index)}
                        icon={<MdCancel />}
                      />
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="photosEmpty">
              <div className="emptyNewMessage">
                <MdAddPhotoAlternate />
                <span className="title">
                  {variables.getMessage(
                    'modals.main.settings.sections.background.source.drop_to_upload',
                  )}
                </span>
                <span className="subtitle">
                  {variables.getMessage('modals.main.settings.sections.background.source.formats', {
                    list: 'jpeg, png, webp, webm, gif, mp4, webm, ogg',
                  })}
                </span>
                <Button
                  type="settings"
                  onClick={uploadCustomBackground}
                  icon={<MdFolder />}
                  label={variables.getMessage(
                    'modals.main.settings.sections.background.source.select',
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <FileUpload
        id="bg-input"
        accept="image/jpeg, image/png, image/webp, image/webm, image/gif, video/mp4, video/webm, video/ogg"
        loadFunction={(e, fileIndex) => {
          const index = currentBackgroundIndex + fileIndex;
          handleCustomBackground(e, index);
        }}
      />
      {hasVideo && (
        <>
          <Checkbox
            name="backgroundVideoLoop"
            text={variables.getMessage(
              'modals.main.settings.sections.background.source.loop_video',
            )}
          />
          <Checkbox
            name="backgroundVideoMute"
            text={variables.getMessage(
              'modals.main.settings.sections.background.source.mute_video',
            )}
          />
        </>
      )}
      <Modal
        closeTimeoutMS={100}
        onRequestClose={() => setCustomURLModal(false)}
        isOpen={customURLModal}
        className="Modal resetmodal mainModal"
        overlayClassName="Overlay resetoverlay"
        ariaHideApp={false}
      >
        <CustomURLModal
          modalClose={addCustomURL}
          urlError={urlError}
          modalCloseOnly={() => setCustomURLModal(false)}
        />
      </Modal>
    </>
  );
});

CustomSettings.displayName = 'CustomSettings';

export default CustomSettings;
