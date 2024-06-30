import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
    createStackNavigator: () => ({
        Navigator: ({ children }) => children,
        Screen: jest.fn(),
    }),
}));

jest.mock('../src/screens/SplashScreen', () => 'SplashScreen');
jest.mock('../src/screens/HomeScreen', () => 'HomeScreen');
jest.mock('../src/screens/AssetDetailScreen', () => 'AssetDetailScreen');

describe('App', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<App />);
        expect(getByTestId('app-root')).toBeTruthy();
    });
});