import axios from 'axios';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// In-memory cache
const memoryCache: {[key: string]: any} = {};

// Cache system
const cacheData = (key: string, data: any) => {
  memoryCache[key] = data;
};

const getCachedData = (key: string) => {
  return memoryCache[key] || null;
};

const fetchUSDTINRPrice = async () => {
  const cacheKey = 'USDT_INR_PRICE';
  const cachedPrice = getCachedData(cacheKey);
  if (cachedPrice) {
    return cachedPrice;
  }

  try {
    const response = await axios.get(
      `${COINGECKO_API_URL}/simple/price?ids=tether&vs_currencies=inr`,
    );
    const price = response.data.tether.inr;
    cacheData(cacheKey, price);
    return price;
  } catch (error) {
    const approximatePrice = 83;
    cacheData(cacheKey, approximatePrice);
    return approximatePrice;
  }
};

const fetchCoinGeckoDetails = async (
  coinIds: string[],
): Promise<{[key: string]: string}> => {
  const cacheKey = `COINGECKO_BATCH_${coinIds.join('_')}`;
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    // console.log(
    //   `Using cached logo URLs for ${Object.keys(cachedData).length} coins`,
    // );
    return cachedData;
  }

  const logoUrls: {[key: string]: string} = {};
  const chunkSize = 50; // CoinGecko allows up to 50 ids per request

  for (let i = 0; i < coinIds.length; i += chunkSize) {
    const chunk = coinIds.slice(i, i + chunkSize);
    try {
      const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: chunk.join(','),
          order: 'market_cap_desc',
          per_page: chunkSize,
          page: 1,
          sparkline: true,
        },
      });

      response.data.forEach((coin: any) => {
        logoUrls[coin.id] = coin.image;
      });

      // console.log(
      //   `Fetched ${response.data.length} logo URLs for chunk ${
      //     i / chunkSize + 1
      //   }`,
      // );

      // avoid rate limiting
      if (i + chunkSize < coinIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(
        `Error fetching logo URLs for chunk ${i / chunkSize + 1}:`,
        error,
      );
    }
  }

  cacheData(cacheKey, logoUrls);
  return logoUrls;
};

const mapToCoinGeckoId = (symbol: string) => {
  const commonMappings: {[key: string]: string} = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    ADA: 'cardano',
    XRP: 'ripple',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    UNI: 'uniswap',
    BCH: 'bitcoin-cash',
    LTC: 'litecoin',
    LINK: 'chainlink',
    MATIC: 'matic-network',
    XLM: 'stellar',
    ETC: 'ethereum-classic',
    ALGO: 'algorand',
    TRX: 'tron',
    FIL: 'filecoin',
    XTZ: 'tezos',
    ATOM: 'cosmos',
    AAVE: 'aave',
  };

  return commonMappings[symbol] || symbol.toLowerCase();
};

export const fetchAssets = async (page: number, limit: number) => {
  try {
    const [tickerResponse, priceResponse] = await Promise.all([
      axios.get(`${BINANCE_API_URL}/ticker/24hr`),
      axios.get(`${BINANCE_API_URL}/ticker/price`),
    ]);

    const usdtInrPrice = await fetchUSDTINRPrice();

    const filteredTickers = tickerResponse.data.filter(
      (ticker: any) =>
        ticker.symbol.endsWith('USDT') || ticker.symbol.endsWith('INR'),
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickers = filteredTickers.slice(startIndex, endIndex);

    const symbols = paginatedTickers.map((ticker: any) =>
      ticker.symbol.endsWith('INR')
        ? ticker.symbol.replace('INR', '')
        : ticker.symbol.replace('USDT', ''),
    );

    const coinIds = symbols.map(mapToCoinGeckoId);
    const logoUrls = await fetchCoinGeckoDetails(coinIds);

    const sparklineData = await fetchMultipleAssets24hData(symbols);
    // console.log(
    //   `Fetched sparkline data for ${Object.keys(sparklineData).length} symbols`,
    // );
    const coinGeckoResponse = await axios.get(
      `${COINGECKO_API_URL}/coins/markets`,
      {
        params: {
          vs_currency: 'inr',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      },
    );
    const coinDetails = coinGeckoResponse.data.reduce((acc, coin) => {
      acc[coin.symbol.toUpperCase()] = {
        name: coin.name,
        logoUrl: coin.image,
      };
      return acc;
    }, {});

    const combinedData = paginatedTickers.map((ticker: any) => {
      const priceInfo = priceResponse.data.find(
        (price: any) => price.symbol === ticker.symbol,
      );

      let price, symbol;
      if (ticker.symbol.endsWith('INR')) {
        price = parseFloat(priceInfo?.price || ticker.lastPrice);
        symbol = ticker.symbol.replace('INR', '');
      } else {
        price = parseFloat(priceInfo?.price || ticker.lastPrice) * usdtInrPrice;
        symbol = ticker.symbol.replace('USDT', '');
      }

      const coinGeckoId = mapToCoinGeckoId(symbol);
      const logoUrl = logoUrls[coinGeckoId] || 'https://via.placeholder.com/32';

      const coinDetail = coinDetails[symbol] || {};

      return {
        symbol: symbol,
        name: coinDetail.name || symbol,
        price: price,
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume:
          parseFloat(ticker.volume) *
          (ticker.symbol.endsWith('INR') ? 1 : usdtInrPrice),
        high:
          parseFloat(ticker.highPrice) *
          (ticker.symbol.endsWith('INR') ? 1 : usdtInrPrice),
        low:
          parseFloat(ticker.lowPrice) *
          (ticker.symbol.endsWith('INR') ? 1 : usdtInrPrice),
        logoUrl: logoUrl,
        sparklineData: sparklineData[symbol] || [],
      };
    });
    // console.log(`Combined data for ${combinedData.length} assets`);

    return {
      assets: combinedData,
      hasMore: endIndex < filteredTickers.length,
    };
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const fetchAssetDetail = async (symbol: string) => {
  try {
    const usdtInrPrice = await fetchUSDTINRPrice();
    let tickerResponse, priceResponse;
    try {
      [tickerResponse, priceResponse] = await Promise.all([
        axios.get(`${BINANCE_API_URL}/ticker/24hr?symbol=${symbol}INR`),
        axios.get(`${BINANCE_API_URL}/ticker/price?symbol=${symbol}INR`),
      ]);
    } catch {
      [tickerResponse, priceResponse] = await Promise.all([
        axios.get(`${BINANCE_API_URL}/ticker/24hr?symbol=${symbol}USDT`),
        axios.get(`${BINANCE_API_URL}/ticker/price?symbol=${symbol}USDT`),
      ]);
    }

    const ticker = tickerResponse.data;
    const priceInfo = priceResponse.data;

    const isINRPair = ticker.symbol.endsWith('INR');
    const price = parseFloat(priceInfo.price) * (isINRPair ? 1 : usdtInrPrice);

    const coinGeckoId = mapToCoinGeckoId(symbol);
    const logoUrl = await fetchCoinGeckoDetails([coinGeckoId]);

    const coinGeckoResponse = await axios.get(
      `${COINGECKO_API_URL}/coins/${coinGeckoId}`,
      {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      },
    );

    const coinGeckoData = coinGeckoResponse.data;

    return {
      symbol: symbol,
      name: coinGeckoData.name || symbol,
      price: price,
      priceChangePercent: parseFloat(ticker.priceChangePercent),
      volume: parseFloat(ticker.volume) * (isINRPair ? 1 : usdtInrPrice),
      high: parseFloat(ticker.highPrice) * (isINRPair ? 1 : usdtInrPrice),
      low: parseFloat(ticker.lowPrice) * (isINRPair ? 1 : usdtInrPrice),
      logoUrl: logoUrl[coinGeckoId],
      marketCap: coinGeckoData.market_data?.market_cap?.inr || 'N/A',
      circulatingSupply: coinGeckoData.market_data?.circulating_supply || 'N/A',
      popularity: coinGeckoData.market_cap_rank
        ? `#${coinGeckoData.market_cap_rank}`
        : 'N/A',
    };
  } catch (error) {
    console.error('Error fetching asset detail:', error);
    throw error;
  }
};

export const fetchHistoricalData = async (
  symbol: string,
  interval: string,
  startTime?: number,
  endTime?: number,
) => {
  try {
    const usdtInrPrice = await fetchUSDTINRPrice();

    let response;
    try {
      response = await axios.get(`${BINANCE_API_URL}/klines`, {
        params: {
          symbol: `${symbol}INR`,
          interval,
          startTime,
          endTime,
          limit: 1000,
        },
        timeout: 10000,
      });
    } catch (error) {
      // console.error(
      //   `Failed to fetch ${symbol}INR data, trying ${symbol}USDT`,
      //   error,
      // );
      response = await axios.get(`${BINANCE_API_URL}/klines`, {
        params: {
          symbol: `${symbol}USDT`,
          interval,
          startTime,
          endTime,
          limit: 1000,
        },
        timeout: 10000,
      });
    }

    const isINRPair = response.config.params.symbol.endsWith('INR');

    const mappedData = response.data.map((candle: any[]) => ({
      time: candle[0],
      open: parseFloat(candle[1]) * (isINRPair ? 1 : usdtInrPrice),
      high: parseFloat(candle[2]) * (isINRPair ? 1 : usdtInrPrice),
      low: parseFloat(candle[3]) * (isINRPair ? 1 : usdtInrPrice),
      close: parseFloat(candle[4]) * (isINRPair ? 1 : usdtInrPrice),
      volume: parseFloat(candle[5]) * (isINRPair ? 1 : usdtInrPrice),
    }));

    return mappedData;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const subscribeToTickerWebSocket = (
  symbol: string,
  callback: (data: any) => void,
) => {
  let ws: WebSocket | null = null;
  let usdtInrPrice: number;

  const connect = () => {
    ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`,
    );

    ws.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
    };

    ws.onmessage = async event => {
      const tickerData = JSON.parse(event.data);
      if (!usdtInrPrice) {
        usdtInrPrice = await fetchUSDTINRPrice();
      }
      const inrTickerData = {
        ...tickerData,
        c: parseFloat(tickerData.c) * usdtInrPrice,
        h: parseFloat(tickerData.h) * usdtInrPrice,
        l: parseFloat(tickerData.l) * usdtInrPrice,
        o: parseFloat(tickerData.o) * usdtInrPrice,
        v: parseFloat(tickerData.v) * usdtInrPrice,
      };
      callback(inrTickerData);
    };

    ws.onerror = error => {
      console.error(`WebSocket error for ${symbol}:`, error);
    };

    ws.onclose = event => {
      // console.log(`WebSocket closed for ${symbol}. Reconnecting...`);
      setTimeout(connect, 1000);
    };
  };

  connect();

  return () => {
    if (ws) {
      ws.close();
    }
  };
};

export const fetchMultipleAssets24hData = async (symbols: string[]) => {
  try {
    const promises = symbols.map(symbol => {
      return fetchHistoricalData(
        symbol,
        '1h',
        Date.now() - 24 * 60 * 60 * 1000,
        Date.now(),
      );
    });

    const results = await Promise.all(promises);

    const reducedResults = symbols.reduce((acc, symbol, index) => {
      acc[symbol] = results[index].map(candle => candle.close);
      return acc;
    }, {} as Record<string, number[]>);

    return reducedResults;
  } catch (error) {
    console.error('Error fetching multiple assets 24h data:', error);
    throw error;
  }
};
