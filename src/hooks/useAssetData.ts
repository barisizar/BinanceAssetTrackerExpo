import {useState, useEffect, useCallback} from 'react';
import {
  fetchAssets,
  fetchAssetDetail,
  fetchHistoricalData,
} from '../services/api';

const ITEMS_PER_PAGE = 50;

export const useAssetData = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNumber: number) => {
    try {
      const {assets: fetchedAssets, hasMore: moreAvailable} = await fetchAssets(
        pageNumber,
        ITEMS_PER_PAGE,
      );
      setHasMore(moreAvailable);
      return fetchedAssets;
    } catch (err) {
      setError('Failed to fetch assets. Please try again.');
      return [];
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const initialAssets = await fetchData(1);
      setAssets(initialAssets);
      setLoading(false);
    };

    initialFetch();
  }, [fetchData]);

  const loadMoreAssets = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;
    const newAssets = await fetchData(nextPage);

    setAssets(prevAssets => [...prevAssets, ...newAssets]);
    setPage(nextPage);
    setLoadingMore(false);
  }, [fetchData, loadingMore, hasMore, page]);

  useEffect(() => {
    console.log('[useAssetData] State updated:', {
      assetsCount: assets.length,
      loading,
      loadingMore,
      error,
      page,
      hasMore,
    });
  }, [assets, loading, loadingMore, error, page, hasMore]);

  return {
    assets,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreAssets,
  };
};

export const useAssetDetailData = (symbol: string) => {
  const [assetDetail, setAssetDetail] = useState<any>(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{data: []}],
  });
  const [timeFrame, setTimeFrame] = useState('1H');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const formatChartData = (data: any[]) => {
    if (!data || data.length === 0) {
      return {labels: [], datasets: [{data: []}]};
    }

    const labels = data.map(item => {
      const date = new Date(item.time);
      switch (timeFrame) {
        case '1H':
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        case '24H':
          return date.toLocaleString([], {hour: '2-digit', minute: '2-digit'});
        case '1W':
          return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });
        case '1M':
          return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });
        case '6M':
          return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });
        case '1Y':
          return date.toLocaleDateString([], {
            month: 'short',
            year: 'numeric',
          });
        case 'All':
          return date.toLocaleDateString([], {
            month: 'short',
            year: 'numeric',
          });
        default:
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
      }
    });

    const prices = data.map(item => parseFloat(item.close));

    return {
      labels,
      datasets: [{data: prices}],
    };
  };

  const loadAssetDetail = useCallback(async () => {
    try {
      const detail = await fetchAssetDetail(symbol);
      setAssetDetail(detail);
      setStats({
        marketCap: detail.marketCap || 'N/A',
        volume: detail.volume || 'N/A',
        circulatingSupply: detail.circulatingSupply || 'N/A',
        popularity: detail.popularity || 'N/A',
      });
    } catch (error) {
      setError('Failed to load asset details. Please try again.');
    }
  }, [symbol]);

  const loadHistoricalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endTime = new Date().getTime();
      let startTime;
      let interval;

      switch (timeFrame) {
        case '1H':
          startTime = endTime - 3600000;
          interval = '1m';
          break;
        case '24H':
          startTime = endTime - 86400000;
          interval = '15m';
          break;
        case '1W':
          startTime = endTime - 604800000;
          interval = '1h';
          break;
        case '1M':
          startTime = endTime - 2592000000;
          interval = '4h';
          break;
        case '6M':
          startTime = endTime - 6 * 2592000000;
          interval = '4h';
          break;
        case '1Y':
          startTime = endTime - 31536000000;
          interval = '1d';
          break;
        case 'All':
          startTime = new Date('2009-01-03').getTime();
          interval = '1d';
          break;
        default:
          startTime = endTime - 3600000;
          interval = '1m';
      }

      const data = await fetchHistoricalData(
        symbol,
        interval,
        startTime,
        endTime,
      );
      const formattedData = formatChartData(data);
      setChartData(formattedData);

      if (data.length > 0) {
        const latestData = data[data.length - 1];

        setAssetDetail(prevDetail => {
          if (prevDetail) {
            return {
              ...prevDetail,
              price: parseFloat(latestData.close),
              priceChangePercent:
                ((parseFloat(latestData.close) - parseFloat(data[0].close)) /
                  parseFloat(data[0].close)) *
                100,
              volume: parseFloat(latestData.volume),
            };
          }
          return prevDetail;
        });

        setStats(prevStats => {
          const newStats = {
            ...prevStats,
            marketCap: latestData.marketCap || prevStats?.marketCap || 'N/A',
            volume: parseFloat(latestData.volume) || prevStats?.volume || 'N/A',
            circulatingSupply:
              latestData.circulatingSupply ||
              prevStats?.circulatingSupply ||
              'N/A',
            popularity: latestData.popularity || prevStats?.popularity || 'N/A',
          };
          return newStats;
        });
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeFrame]);

  const updateStatsForTime = (selectedTime: string) => {
    const selectedIndex = chartData.labels.indexOf(selectedTime);
    if (selectedIndex !== -1) {
      const selectedData = chartData.datasets[0].data[selectedIndex];
      setStats(prevStats => {
        const updatedStats = {
          ...prevStats,
          price: selectedData,
        };
        return updatedStats;
      });
    }
  };

  useEffect(() => {
    loadAssetDetail();
  }, [loadAssetDetail]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData, timeFrame]);

  return {
    assetDetail,
    chartData,
    timeFrame,
    isLoading,
    error,
    stats,
    setTimeFrame,
    updateStatsForTime,
  };
};
