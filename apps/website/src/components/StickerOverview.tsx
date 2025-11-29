import * as React from 'react';
import { DefaultButton, Icon, Spinner, TextField, initializeIcons } from '@fluentui/react';

// Initialize Fluent UI icons
initializeIcons();

export interface IStickerOverviewProps {
  min: number;
  imageHeight: number;
}

interface ISticker {
  Id: number;
  Title: string;
  Description: string;
  Image: string;
  Price: number;
  Total: number;
}

export const StickerOverview: React.FunctionComponent<IStickerOverviewProps> = ({
  min,
  imageHeight,
}: React.PropsWithChildren<IStickerOverviewProps>) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [stickers, setStickers] = React.useState<ISticker[]>([]);
  const [filter, setFilter] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const fetchStickers = async (minimalAmount: number): Promise<void> => {
    setLoading(true);
    setStickers([]);
    setError('');

    let listApiUrl = `/api/stickers`;

    if (minimalAmount > 0) {
      listApiUrl += `?min=${minimalAmount}`;
    }

    try {
      const response = await fetch(listApiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        const items = result.value as ISticker[];
        setStickers(items);
      } else {
        setError(`Error fetching stickers: ${response.status}`);
      }
    } catch (err) {
      setError(`Error fetching stickers${(err as Error).message ? `: ${(err as Error).message}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStickers(min);
  }, [min]);

  return (
    <section
      className='sticker_inventory w-full'
      data-testid="sticker_inventory"
    >
      {
        error && (
          <div
            className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4`}
            role="alert"
            data-testid="sticker_inventory__error">
            <span className="block sm:inline">{error}</span>
          </div>
        )
      }

      <div className='flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-grow max-w-md">
          <TextField
            type='number'
            placeholder='Min stock...'
            value={filter}
            onChange={(_, value) => setFilter(value || '')}
            data-testid="sticker_inventory__filter__input"
            className='w-full'
            styles={{ fieldGroup: { height: 40 } }}
          />

          <DefaultButton
            onClick={() => fetchStickers(parseInt(filter) || 0)}
            data-testid="sticker_inventory__filter__button"
            className="h-10 px-6 bg-pink-600 text-white hover:bg-pink-700 border-none transition-colors"
          >
            <Icon iconName='Filter' className="mr-2" />
            Filter
          </DefaultButton>
        </div>

        <div
          className='text-sm text-gray-500 font-medium'
          data-testid="sticker_inventory__refresh">
          Updated: {(new Date()).toLocaleTimeString()}
        </div>
      </div>

      {
        stickers.length > 0 ? (
          <div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
            data-testid="sticker_inventory__overview">
            {
              stickers.map((sticker) => (
                <div
                  key={sticker.Id}
                  className='group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full'
                  data-testid="sticker_inventory__overview__sticker">
                  <div className='relative overflow-hidden bg-gray-50'>
                    <img
                      src={`https://ik.imagekit.io/pyodstickers/tr:w-400,h-${imageHeight || 200}/stickers/${sticker.Image}`}
                      alt={sticker.Title}
                      className={`w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${imageHeight ? "" : "h-64"}`}
                      style={{ height: imageHeight || 250 }}
                    />

                    <div
                      className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6'
                      data-testid='sticker_inventory__sticker__description'>
                      <div className='text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300'>
                        <p className='text-base font-medium leading-relaxed'>{sticker.Description}</p>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${sticker.Total > 25 ? 'bg-green-100 text-green-800' :
                          sticker.Total > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {sticker.Total > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-5 flex-grow flex flex-col justify-between bg-white`}>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors'>{sticker.Title}</h3>
                      <div className="h-1 w-12 bg-gray-200 rounded mb-4 group-hover:bg-pink-500 transition-colors duration-300"></div>
                    </div>

                    <div className='flex items-end justify-between mt-2'>
                      <div className='flex flex-col'>
                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Price</span>
                        <span className='text-2xl font-bold text-gray-900'>€ <span data-testid="sticker_inventory__sticker__price">{sticker.Price.toFixed(2)}</span></span>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Quantity</span>
                        <span className='text-lg font-mono font-medium text-gray-700' data-testid="sticker_inventory__sticker__total">{sticker.Total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div
            className='bg-white flex items-center justify-center p-12 rounded-lg shadow-sm border border-gray-100'
            data-testid="sticker_inventory__empty">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900">No stickers found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filter criteria</p>
            </div>
          </div>
        )
      }

      {
        loading && (
          <div
            className={`bg-white/80 backdrop-blur-sm absolute inset-0 flex items-center justify-center z-10 rounded-lg`}
            data-testid="sticker_inventory__spinner">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
              <Spinner label={`Fetching stickers...`} />
            </div>
          </div>
        )
      }
    </section>
  );
};
