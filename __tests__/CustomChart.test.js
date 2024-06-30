import React from 'react';
import renderer from 'react-test-renderer';
import CustomChart from '../src/components/CustomChart';

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Dimensions = {
        get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
    };
    RN.PanResponder = {
        create: jest.fn(() => ({
            panHandlers: {},
        })),
    };
    return RN;
});

describe('CustomChart', () => {
    const mockData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{ data: [10, 20, 15, 25, 30] }],
    };

    it('renders correctly', () => {
        const tree = renderer.create(
            <CustomChart data={mockData} onSelectDataPoint={jest.fn()} />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
