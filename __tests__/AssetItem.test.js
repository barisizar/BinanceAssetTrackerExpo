import React from 'react';
import renderer from 'react-test-renderer';
import { AssetItem } from '../src/components/AssetItem';

jest.mock('../src/services/api', () => ({
    subscribeToTickerWebSocket: jest.fn(() => jest.fn()),
}));

jest.mock('react-native-svg-charts', () => ({
    LineChart: 'LineChart',
}));

describe('AssetItem', () => {
    const mockAsset = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        priceChangePercent: 5.0,
        logoUrl: 'https://example.com/btc.png',
        sparklineData: [49000, 50000, 51000, 50500, 50000],
    };

    it('renders correctly', () => {
        const tree = renderer.create(<AssetItem asset={mockAsset} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});