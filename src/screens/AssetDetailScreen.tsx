import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomChart from '../components/CustomChart';
import {useAssetDetailData} from '../hooks/useAssetData';
import { formatPriceInINR, formatNumberWithUnits } from '../utils/formatPrice';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type RootStackParamList = {
  AssetDetail: {asset: any};
};

type AssetDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'AssetDetail'>;
};

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({route}) => {
  const {asset} = route.params;
  const navigation = useNavigation();
  const {
    assetDetail,
    chartData,
    timeFrame,
    isLoading,
    error,
    stats,
    setTimeFrame,
    updateStatsForTime,
  } = useAssetDetailData(asset.symbol);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    label: string;
    value: number;
  } | null>(null);

    useEffect(() => {
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [isLoading]);

  const timeFrames = ['1H', '24H', '1W', '1M', '6M', '1Y', 'All'];

  const handleSelectDataPoint = (label: string, value: number) => {
    setSelectedDataPoint({label, value});
    updateStatsForTime(label);
  };

if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }


if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text>Failed to load asset details. Please try again.</Text>
    </View>
  );
}

  const formattedChartData = {
    labels: chartData.labels,
    datasets: [{data: chartData.datasets}],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Image source={{uri: asset.logoUrl}} style={styles.logo} />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.name}>{assetDetail?.name}</Text>
              <Text style={[styles.symbol, {marginLeft: 5}]}>
                ({assetDetail?.symbol})
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPriceInINR(assetDetail?.price)}</Text>
          <Text
            style={[
              styles.change,
              {
                color:
                  assetDetail?.priceChangePercent >= 0 ? '#4CD964' : '#FF3B30',
                marginLeft: 5,
              },
            ]}>
            {assetDetail?.priceChangePercent >= 0 ? '+' : ''}
            {assetDetail?.priceChangePercent.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.chartContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <CustomChart
              data={chartData}
              onSelectDataPoint={handleSelectDataPoint}
            />
          )}
        </View>

        <View style={styles.timeFrameContainer}>
          {timeFrames.map(frame => (
            <TouchableOpacity
              key={frame}
              style={[
                styles.timeFrameButton,
                timeFrame === frame && styles.selectedTimeFrame,
              ]}
              onPress={() => setTimeFrame(frame)}>
              <Text
                style={[
                  styles.timeFrameText,
                  timeFrame === frame && styles.selectedTimeFrameText,
                ]}>
                {frame}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsHeader}>Market Stats</Text>
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color="#4A90E2" />
              <Text style={styles.statLabel}>Market Cap</Text>
              <Text style={styles.statValue}>
                {stats.marketCap !== 'N/A' ? `₹${formatNumberWithUnits(stats.marketCap)}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="bar-chart" size={20} color="#4A90E2" />
              <Text style={styles.statLabel}>Volume</Text>
              <Text style={styles.statValue}>
                {stats.volume !== 'N/A' ? `₹${formatNumberWithUnits(stats.volume)}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="donut-large" size={20} color="#4A90E2" />
              <Text style={styles.statLabel}>Circulating Supply</Text>
              <Text style={styles.statValue}>
                {stats.circulatingSupply ? `${formatNumberWithUnits(stats.circulatingSupply)}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#4A90E2" />
              <Text style={styles.statLabel}>Popularity</Text>
              <Text style={styles.statValue}>
                {stats.popularity !== 'N/A' ? `${stats.popularity}` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  symbol: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedTimeFrame: {
    backgroundColor: '#ECF4FF',
    borderWidth:0.5,
    borderColor: '#0063F5'
  },
  timeFrameText: {
    fontSize: 14,
    color: '#000',
  },
  selectedTimeFrameText: {
    color: '#0063F5',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop:8
  },
  statsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  chartContainer: {
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 30,
    marginTop: 8,
  },
  timelineTick: {
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 10,
    color: '#666',
  },
  statsColumn: {
    flexDirection: 'column',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12 
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  errorContainer:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default AssetDetailScreen;
