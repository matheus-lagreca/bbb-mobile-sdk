//
//  SampleHandler.swift
//  BBBScreenShare
//
//  Broadcast Upload Extension that feeds the screen to the main app.
//  Adapted from the jitsi-meet-sdk-samples broadcast extension, which is the
//  integration @livekit/react-native documents for iOS screen sharing.
//
//  The main app (@livekit/react-native-webrtc ScreenCaptureController) listens
//  on a Unix socket named "rtc_SSFD" in the shared App Group container once
//  LiveKit starts a screenshare. This extension connects to it and streams
//  JPEG-encoded frames. Closing the socket on either side ends the share.
//

import ReplayKit

private enum Constants {
    // Same key the app's Info.plist uses (read by react-native-webrtc).
    static let appGroupInfoKey = "RTCAppGroupIdentifier"
    static let socketFileName = "rtc_SSFD"
    // The app only opens the socket after it learns the broadcast started and
    // publishes the LiveKit track. If it never does (not the presenter, not in
    // a LiveKit meeting, app killed) end the broadcast instead of recording
    // into the void.
    static let connectTimeout: DispatchTimeInterval = .seconds(10)
    // Error codes shown by the system when the broadcast finishes.
    static let sharingStoppedCode = 10001
    static let appUnavailableCode = 10002
}

class SampleHandler: RPBroadcastSampleHandler {

    private var clientConnection: SocketConnection?
    private var uploader: SampleUploader?
    private var connectTimer: DispatchSourceTimer?

    private var frameCount: Int = 0

    private var appGroupIdentifier: String? {
        Bundle.main.object(forInfoDictionaryKey: Constants.appGroupInfoKey) as? String
    }

    private var socketFilePath: String {
        guard let appGroupIdentifier = appGroupIdentifier,
              let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            return ""
        }

        return sharedContainer.appendingPathComponent(Constants.socketFileName).path
    }

    override init() {
        super.init()
        if let connection = SocketConnection(filePath: socketFilePath) {
            clientConnection = connection
            setupConnection()

            uploader = SampleUploader(connection: connection)
        }
    }

    override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
        frameCount = 0

        DarwinNotificationCenter.shared.postNotification(.broadcastStarted)
        openConnection()
    }

    override func broadcastPaused() {
        // Samples stop being delivered; nothing to do.
    }

    override func broadcastResumed() {
        // Samples delivery resumes; nothing to do.
    }

    override func broadcastFinished() {
        connectTimer?.cancel()
        connectTimer = nil
        DarwinNotificationCenter.shared.postNotification(.broadcastStopped)
        clientConnection?.close()
    }

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        switch sampleBufferType {
        case RPSampleBufferType.video:
            // Simple frame rate cap: forward every third frame.
            frameCount += 1
            if frameCount % 3 == 0 {
                uploader?.send(sample: sampleBuffer)
            }
        default:
            break
        }
    }
}

private extension SampleHandler {

    func setupConnection() {
        clientConnection?.didClose = { [weak self] error in
            print("client connection did close \(String(describing: error))")

            if let error = error {
                self?.finishBroadcastWithError(error)
            } else {
                // The system shows NSError descriptions more cleanly than a plain Error.
                let customError = NSError(
                    domain: RPRecordingErrorDomain,
                    code: Constants.sharingStoppedCode,
                    userInfo: [NSLocalizedDescriptionKey: "Screen sharing stopped"]
                )
                self?.finishBroadcastWithError(customError)
            }
        }
    }

    func openConnection() {
        let queue = DispatchQueue(label: "org.bbb.mobilesdk.broadcast.connectTimer")
        let timer = DispatchSource.makeTimerSource(queue: queue)
        let deadline = DispatchTime.now() + Constants.connectTimeout

        timer.schedule(deadline: .now(), repeating: .milliseconds(100), leeway: .milliseconds(500))
        timer.setEventHandler { [weak self] in
            guard let self = self else {
                timer.cancel()
                return
            }

            if self.clientConnection?.open() == true {
                timer.cancel()
                self.connectTimer = nil
                return
            }

            if DispatchTime.now() >= deadline {
                timer.cancel()
                self.connectTimer = nil
                let error = NSError(
                    domain: RPRecordingErrorDomain,
                    code: Constants.appUnavailableCode,
                    userInfo: [NSLocalizedDescriptionKey: "Screen sharing is only available as presenter during a meeting"]
                )
                self.finishBroadcastWithError(error)
            }
        }

        connectTimer = timer
        timer.resume()
    }
}
