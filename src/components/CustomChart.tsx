import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import Svg, {Path, Circle, Text as SvgText, Line} from 'react-native-svg';
import { formatPriceInINR } from '../utils/formatPrice';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_HEIGHT = 250;
const CHART_WIDTH = SCREEN_WIDTH * 3;
const X_AXIS_HEIGHT = 30;
const MAX_X_LABELS = 12;
const Y_AXIS_PADDING = 0.1; // 10% padding

interface ChartData {
  labels: string[];
  datasets: {data: number[]}[];
}

interface CustomChartProps {
  data: ChartData;
  onSelectDataPoint: (label: string, value: number) => void;
}

const CustomChart: React.FC<CustomChartProps> = ({data, onSelectDataPoint}) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const {minValue, maxValue, path, dataPoints} = useMemo(() => {
    if (!data.datasets[0].data.length) {
      return {minValue: 0, maxValue: 0, path: '', dataPoints: []};
    }

    const minValue = Math.min(...data.datasets[0].data);
    const maxValue = Math.max(...data.datasets[0].data);

    // add padding
    const range = maxValue - minValue;
    const paddedMin = minValue - range * Y_AXIS_PADDING;
    const paddedMax = maxValue + range * Y_AXIS_PADDING;

    const getY = (value: number) => {
      return (
        CHART_HEIGHT -
        ((value - paddedMin) / (paddedMax - paddedMin)) * CHART_HEIGHT
      );
    };

    const dataPoints = data.datasets[0].data.map((point, index) => ({
      x: (index / (data.datasets[0].data.length - 1)) * CHART_WIDTH,
      y: getY(point),
      value: point,
      label: data.labels[index],
    }));

    const path = dataPoints.reduce((acc, point, index) => {
      return `${acc} ${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }, '');

    return {minValue: paddedMin, maxValue: paddedMax, path, dataPoints};
  }, [data]);

  const visibleLabels = useMemo(() => {
    const totalPoints = dataPoints.length;
    let step;

    if (totalPoints <= MAX_X_LABELS) {
      step = 1;
    } else if (totalPoints <= MAX_X_LABELS * 2) {
      step = 2;
    } else {
      step = Math.ceil(totalPoints / MAX_X_LABELS);
    }

    return dataPoints.filter((_, index) => index % step === 0);
  }, [dataPoints]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: evt =>
      handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
    onPanResponderMove: evt =>
      handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
  });

  const handleTouch = (touchX: number, touchY: number) => {
    const scrollX = scrollViewRef.current?.contentOffset?.x || 0;
    const adjustedX = touchX + scrollX;

    const closestPoint = dataPoints.reduce((closest, point) => {
      return Math.abs(point.x - adjustedX) < Math.abs(closest.x - adjustedX)
        ? point
        : closest;
    });

    setSelectedPoint(closestPoint);
    onSelectDataPoint(closestPoint.label, closestPoint.value);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: false});
    }, 100);
  }, [data.labels]);

  if (
    !data ||
    !data.datasets ||
    data.datasets.length === 0 ||
    !data.datasets[0].data ||
    data.datasets[0].data.length === 0
  ) {
    return (
      <View style={styles.errorContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <View testID="custom-chart" style={styles.container} >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        {...panResponder.panHandlers}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + X_AXIS_HEIGHT}>
          <Path d={path} fill="none" stroke="#4A90E2" strokeWidth="2" />
          {selectedPoint && (
            <>
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r="5"
                fill="#4A90E2"
              />
              <SvgText
                x={selectedPoint.x}
                y={selectedPoint.y - 10}
                fill="black"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle">
                {formatPriceInINR(selectedPoint.value)}
              </SvgText>
            </>
          )}
          {/* X-axis line */}
          <Line
            x1="0"
            y1={CHART_HEIGHT}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT}
            stroke="#E0E0E0"
            strokeWidth="1"
          />
          {/* X-axis labels and ticks */}
          {visibleLabels.map((point, index) => (
            <React.Fragment key={index}>
              <Line
                x1={point.x}
                y1={CHART_HEIGHT}
                x2={point.x}
                y2={CHART_HEIGHT + 5}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <SvgText
                x={point.x}
                y={CHART_HEIGHT + 20}
                fontSize="10"
                fill="#666"
                textAnchor="middle">
                {point.label}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT + X_AXIS_HEIGHT,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT + X_AXIS_HEIGHT,
  },
  errorContainer: {
    height: CHART_HEIGHT + X_AXIS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default CustomChart;
