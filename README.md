# Binance Asset Tracker

This is an Expo project for tracking cryptocurrency assets using the Binance API.
![simulator_screenshot_D989B108-9755-4415-A765-2BC396287656](https://github.com/barisizar/BinanceAssetTrackerExpo/assets/54599797/4ef270ee-cf00-4cd2-902f-da8d832c2234)

![simulator_screenshot_9C8D5B67-E279-4BD9-8D14-5BB1356E565D](https://github.com/barisizar/BinanceAssetTrackerExpo/assets/54599797/e03c7508-0c8e-4194-a4e6-4f0874b4608c)


## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/binance-asset-tracker.git
   cd binance-asset-tracker
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
   or if you're using yarn:
   ```
   yarn install --legacy-peer-deps
   ```

## Running the App

To start the Expo development server:

```
expo start
```

This will open the Expo DevTools in your browser. You can then run the app on an iOS or Android simulator, or on your physical device using the Expo Go app.

## Testing

To run the tests:

```
npm test
```

or if you're using yarn:

```
yarn test
```

## API Usage Warning

⚠️ **Important**: This app uses the Binance API. If you're not using a pro API key, you might encounter rate limiting (HTTP 429 errors). If this happens, please wait a few minutes before trying again. To avoid this issue, consider upgrading to a pro API key or implementing more aggressive request throttling in the app.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
