import React, {useCallback} from 'react';
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AssetItem} from './AssetItem';
import {useAssetData} from '../hooks/useAssetData';

export const AssetList: React.FC = () => {
  const {assets, loading, loadingMore, hasMore, loadMoreAssets, error} =
    useAssetData();
  const navigation = useNavigation();

  const handleAssetPress = useCallback(
    (asset: any) => {
      navigation.navigate('AssetDetail' as never, {asset} as never);
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: any}) => (
      <TouchableOpacity onPress={() => handleAssetPress(item)}>
        <AssetItem asset={item} />
      </TouchableOpacity>
    ),
    [handleAssetPress],
  );

  if (loading && assets.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" testID="loading-indicator"/>
      </View>
    );
  }

  if (error && assets.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="custom-chart">
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={item => item.symbol}
        onEndReachedThreshold={0.5}
        onEndReached={loadMoreAssets}
        ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});
