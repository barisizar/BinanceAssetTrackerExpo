import React from 'react';
import {View, StyleSheet, SafeAreaView, Text} from 'react-native';
import {AssetList} from '../components/AssetList';

const HomeScreen: React.FC = () => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Trending Coins</Text>
        <AssetList />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
});

export default HomeScreen;
