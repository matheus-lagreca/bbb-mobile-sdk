import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenCaptureModule } = NativeModules;

class AndroidScreenCaptureService {
  constructor() {
    this.eventEmitter = null;
    this.isInitialized = false;

    if (Platform.OS === 'android' && ScreenCaptureModule) {
      this.eventEmitter = new NativeEventEmitter(ScreenCaptureModule);
      this.setupEventListeners();
      this.isInitialized = true;
    }
  }

  setupEventListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('onScreenCaptureStarted', (event) => {
      console.log('Screen capture started:', event);
    });

    this.eventEmitter.addListener('onScreenCaptureStopped', (event) => {
      console.log('Screen capture stopped:', event);
    });

    this.eventEmitter.addListener('onScreenCaptureError', (event) => {
      console.error('Screen capture error:', event);
    });
  }

  async startScreenCapture() {
    if (!this.isInitialized) {
      throw new Error('Android screen capture service not initialized');
    }

    if (Platform.OS !== 'android') {
      throw new Error('Screen capture is only available on Android');
    }

    try {
      console.log('Starting screen capture...');
      const result = await ScreenCaptureModule.startScreenCapture();
      console.log('Screen capture start result:', result);
      return result;
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  }

  async stopScreenCapture() {
    if (!this.isInitialized) {
      throw new Error('Android screen capture service not initialized');
    }

    if (Platform.OS !== 'android') {
      throw new Error('Screen capture is only available on Android');
    }

    try {
      const result = await ScreenCaptureModule.stopScreenCapture();
      console.log('Screen capture stop result:', result);
      return result;
    } catch (error) {
      console.error('Failed to stop screen capture:', error);
      throw error;
    }
  }

  async isScreenCaptureActive() {
    if (!this.isInitialized) {
      return false;
    }

    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await ScreenCaptureModule.isScreenCaptureActive();
    } catch (error) {
      console.error('Failed to check screen capture status:', error);
      return false;
    }
  }

  cleanup() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onScreenCaptureStarted');
      this.eventEmitter.removeAllListeners('onScreenCaptureStopped');
      this.eventEmitter.removeAllListeners('onScreenCaptureError');
    }
  }
}

const androidScreenCaptureService = new AndroidScreenCaptureService();
export default androidScreenCaptureService;
