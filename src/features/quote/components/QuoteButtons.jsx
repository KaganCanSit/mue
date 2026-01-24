import { MdContentCopy, MdStarBorder, MdStar, MdIosShare } from 'react-icons/md';
import { Tooltip } from 'components/Elements';
import { useT } from 'contexts';
import variables from 'config/variables';

/**
 * Quote action buttons component
 */
export default function QuoteButtons({
  onCopy,
  onFavourite,
  onShare,
  isFavourited,
}) {
  const t = useT();
  const showCopy = localStorage.getItem('copyButton') !== 'false';
  const showShare = localStorage.getItem('quoteShareButton') !== 'false';
  const showFavourite = localStorage.getItem('favouriteQuoteEnabled') === 'true';

  return (
    <>
      {showCopy && (
        <Tooltip title={t('widgets.quote.copy')}>
          <button
            onClick={onCopy}
            aria-label={t('widgets.quote.copy')}
          >
            <MdContentCopy className="copyButton" />
          </button>
        </Tooltip>
      )}
      {showShare && (
        <Tooltip title={t('widgets.quote.share')}>
          <button
            onClick={onShare}
            aria-label={t('widgets.quote.share')}
          >
            <MdIosShare className="copyButton" />
          </button>
        </Tooltip>
      )}
      {showFavourite && (
        <Tooltip
          title={
            isFavourited
              ? t('widgets.quote.unfavourite')
              : t('widgets.quote.favourite')
          }
        >
          <button
            onClick={onFavourite}
            aria-label={
              isFavourited
                ? t('widgets.quote.unfavourite')
                : t('widgets.quote.favourite')
            }
          >
            {isFavourited ? (
              <MdStar className="copyButton" />
            ) : (
              <MdStarBorder className="copyButton" />
            )}
          </button>
        </Tooltip>
      )}
    </>
  );
}
