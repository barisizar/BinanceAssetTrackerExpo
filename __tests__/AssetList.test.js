import React from 'react';
import { render } from '@testing-library/react-native';
import { AssetList } from '../src/components/AssetList';

jest.mock('../src/hooks/useAssetData', () => ({
    useAssetData: () => ({
        assets: [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                price: 50000,
                priceChangePercent: 5.00,
                logoUrl: 'https://example.com/btc.png',
                sparklineData: [],
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: 3000,
                priceChangePercent: -2.00,
                logoUrl: 'https://example.com/eth.png',
                sparklineData: [],
            },
        ],
        loading: false,
        loadingMore: false,
        hasMore: true,
        loadMoreAssets: jest.fn(),
        error: null,
    }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}));

describe('AssetList', () => {
    it('renders correctly', () => {
        const { getByText } = render(<AssetList />);
        expect(getByText('Bitcoin')).toBeTruthy();
        expect(getByText('Ethereum')).toBeTruthy();
    });

    it('renders loading state', () => {
        jest.spyOn(require('../src/hooks/useAssetData'), 'useAssetData').mockReturnValueOnce({
            assets: [],
            loading: true,
            loadingMore: false,
            hasMore: true,
            loadMoreAssets: jest.fn(),
            error: null,
        });

        const { getByTestId } = render(<AssetList />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });
});