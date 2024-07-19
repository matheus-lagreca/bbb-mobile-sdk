
#  bbb-mobile-sdk
**bbb-mobile-sdk** is a React Native SDK designed to integrate BigBlueButton into your own React Native mobile app.

## Features
-   Real-time video and audio conferencing capabilities
-   View presentation and screen sharing functionality
-   Recording of meetings
-   Breakout rooms
-   Chat and messaging functionality
-   Polls and shared notes
-   Whiteboard

Check the full list of features present in HTML5 and **bbb-mobile-sdk** [here](../../wiki/Features-table)

## Code dependencies
Android: [here](../../wiki/Android-installation)

iOS: [here](../../wiki/iOS-installation)

## How to integrate with my own BBB server
Currently, **bbb-mobile-sdk** can only integrate with BigBlueButton versions 2.5, 2.6 and 2.7 (experimental). Support for BigBlueButton 3.0 is under development.

**bbb-mobile-sdk** does not yet have all the features that BBB's HTML5 client provides - see the [equivalence table](../../wiki/Features-table) to check if it makes sense for you to integrate this project.

If you are not a mobile developer, it may take a little time to install simulators and Android SDKs, however, after the initial installation the **ONLY** thing you need to join a session is the Join link.

**bbb-mobile-sdk** can be compared as a native HTML5 version.

 ### Easy implementation
 To make things easier, we provide a template that provides all the dependencies for you to develop a simple app using this SDK.
 
 https://github.com/mconf/bbb-mobile-template

 We plan to make this template available with BigBlueButton's Greenlight integrated in the future, but for now we leave it as a simple template.
 
 ### Manual implementation

 If you already have a react-native application that uses the BBB version through a WebView, you can install the component using:

```bash
npm install git+https://github.com/mconf/bbb-mobile-sdk.git#v0.13.6
```

You probably have to build your own native modules (`ios/` and `android/` directories) of your application, and this will require you to install WebRTC modules and other native libraries that require the main application to implement. The native modules you will have to install are listed here.
___

After the initial installation you can start using like

```jsx
import BbbMobileSdk from "bbb-mobile-sdk";
```

Pass the joinUrl of your meeting in the `jUrl` prop, and what to do when the user leave the meeting to the `onLeaveSession` callback:

```jsx
<BbbMobileSdk 
  jUrl={joinUrl} 
  onLeaveSession={() => navigation.replace("Home")} 
/>
```

## Contributing
We welcome contributions from the community. To contribute to the BigBlueButton Mobile SDK, follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and submit a pull request.

Please read our [contribution guidelines](CONTRIBUTING.md) for more details.

## License

**bbb-mobile-sdk** is released under the [MIT License](LICENSE.md).
