import ExpoModulesCore

// Darwin notifications posted by the broadcast upload extension
// (SampleHandler.swift) when the user starts or stops the broadcast. iOS does
// not tell the app what was picked in the broadcast sheet, so this is the only
// way to know the broadcast actually started.
private let broadcastStartedNotification = "iOS_BroadcastStarted"
private let broadcastStoppedNotification = "iOS_BroadcastStopped"

public class BroadcastEventsModule: Module {
  private var isObserving = false

  public func definition() -> ModuleDefinition {
    Name("BroadcastEvents")

    Events("onBroadcastStarted", "onBroadcastStopped")

    OnStartObserving {
      self.addObservers()
    }

    OnStopObserving {
      self.removeObservers()
    }

    OnDestroy {
      self.removeObservers()
    }
  }

  private func addObservers() {
    guard !isObserving else { return }
    isObserving = true

    let center = CFNotificationCenterGetDarwinNotifyCenter()
    let observer = Unmanaged.passUnretained(self).toOpaque()

    for name in [broadcastStartedNotification, broadcastStoppedNotification] {
      CFNotificationCenterAddObserver(center, observer, { _, observer, name, _, _ in
        guard let observer = observer, let name = name?.rawValue as String? else { return }

        let module = Unmanaged<BroadcastEventsModule>.fromOpaque(observer).takeUnretainedValue()
        module.notificationReceived(name)
      }, name as CFString, nil, .deliverImmediately)
    }
  }

  private func removeObservers() {
    guard isObserving else { return }
    isObserving = false

    CFNotificationCenterRemoveEveryObserver(
      CFNotificationCenterGetDarwinNotifyCenter(),
      Unmanaged.passUnretained(self).toOpaque()
    )
  }

  fileprivate func notificationReceived(_ name: String) {
    sendEvent(name == broadcastStartedNotification ? "onBroadcastStarted" : "onBroadcastStopped")
  }
}
