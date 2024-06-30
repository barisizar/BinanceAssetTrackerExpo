import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Image, Animated} from 'react-native';
import {LineChart} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import {subscribeToTickerWebSocket} from '../services/api';

interface AssetItemProps {
  asset: {
    symbol: string;
    name: string;
    price: number;
    priceChangePercent: number;
    logoUrl: string;
    sparklineData: number[];
  };
}

export const AssetItem: React.FC<AssetItemProps> = ({asset}) => {
  const [currentPrice, setCurrentPrice] = useState(asset?.price);
  const [priceChangePercent, setPriceChangePercent] = useState(
    asset.priceChangePercent,
  );
  const [priceChangeColor, setPriceChangeColor] = useState('#1A1A1A');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = subscribeToTickerWebSocket(asset?.symbol, data => {
      const newPrice = parseFloat(data.c);
      setCurrentPrice(prevPrice => {
        if (newPrice !== prevPrice) {
          setPriceChangeColor(newPrice > prevPrice ? '#00C087' : '#FF3B30');
          animatePriceChange();
        }
        return newPrice;
      });
      setPriceChangePercent(parseFloat(data.P));
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [asset.symbol]);

  const animatePriceChange = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPriceChangeColor('#1A1A1A');
    });
  };

  const chartColor = priceChangePercent >= 0 ? '#00C087' : '#FF3B30';
  const changeColor = priceChangePercent >= 0 ? '#00C087' : '#FF3B30';

  const validSparklineData =
    asset?.sparklineData?.filter(value => Number.isFinite(value)) || [];
  const renderChart = validSparklineData.length >= 2;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(currentPrice);

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Image source={{uri: asset?.logoUrl}} style={styles.logo} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{asset?.name}</Text>
          <Text style={styles.symbol}>{asset?.symbol}</Text>
        </View>
      </View>
      {renderChart && (
        <View style={styles.chartContainer}>
          <LineChart
            style={{height: 40, width: 60}}
            data={validSparklineData}
            svg={{stroke: chartColor, strokeWidth: 2}}
            contentInset={{top: 10, bottom: 10}}
            curve={shape.curveNatural}
          />
        </View>
      )}
      <View style={styles.rightContent}>
        <Animated.Text
          style={[
            styles.price,
            {
              color: priceChangeColor,
              opacity: fadeAnim,
            },
          ]}>
          {formattedPrice}
        </Animated.Text>
        <Text style={[styles.change, {color: changeColor}]}>
          {priceChangePercent >= 0 ? '+' : ''}
          {priceChangePercent.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  symbol: {
    fontSize: 14,
    color: '#888',
  },
  chartContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  rightContent: {
    alignItems: 'flex-end',
    flex: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    fontSize: 14,
  },
});
