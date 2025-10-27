package org.bbb.mobilesdk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.util.DisplayMetrics
import android.view.WindowManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenCaptureModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private var mediaProjectionManager: MediaProjectionManager? = null
    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var isRecording = false
    private val REQUEST_CODE = 1000
    
    companion object {
        @Volatile
        private var INSTANCE: ScreenCaptureModule? = null
        
        fun getInstance(): ScreenCaptureModule? = INSTANCE
        
        fun setInstance(instance: ScreenCaptureModule?) {
            INSTANCE = instance
        }
    }
    
    init {
        setInstance(this)
    }

    override fun getName(): String {
        return "ScreenCaptureModule"
    }

    @ReactMethod
    fun startScreenCapture(promise: Promise) {
        try {
            android.util.Log.d("ScreenCaptureModule", "startScreenCapture called")
            
            if (isRecording) {
                android.util.Log.w("ScreenCaptureModule", "Screen capture is already running")
                promise.reject("ALREADY_RECORDING", "Screen capture is already running")
                return
            }

            val activity = currentActivity
            if (activity == null) {
                android.util.Log.e("ScreenCaptureModule", "No current activity available")
                promise.reject("NO_ACTIVITY", "No current activity available")
                return
            }

            // Start foreground service first, before requesting permission
            android.util.Log.d("ScreenCaptureModule", "Starting foreground service early")
            val serviceIntent = Intent(reactContext, ScreenCaptureService::class.java).apply {
                action = ScreenCaptureService.ACTION_START_SCREEN_CAPTURE
            }
            reactContext.startForegroundService(serviceIntent)
            android.util.Log.d("ScreenCaptureModule", "Foreground service started early")

            android.util.Log.d("ScreenCaptureModule", "Getting MediaProjectionManager")
            mediaProjectionManager = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
            val captureIntent = mediaProjectionManager?.createScreenCaptureIntent()
            
            if (captureIntent != null) {
                android.util.Log.d("ScreenCaptureModule", "Starting activity for result")
                activity.startActivityForResult(captureIntent, REQUEST_CODE)
                promise.resolve("Permission requested")
            } else {
                android.util.Log.e("ScreenCaptureModule", "Could not create screen capture intent")
                promise.reject("NO_INTENT", "Could not create screen capture intent")
            }
        } catch (e: Exception) {
            android.util.Log.e("ScreenCaptureModule", "Error in startScreenCapture: ${e.message}", e)
            promise.reject("START_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopScreenCapture(promise: Promise) {
        try {
            if (!isRecording) {
                promise.reject("NOT_RECORDING", "Screen capture is not running")
                return
            }

            stopRecording()
            promise.resolve("Screen capture stopped")
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isScreenCaptureActive(promise: Promise) {
        promise.resolve(isRecording)
    }

    fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        android.util.Log.d("ScreenCaptureModule", "handleActivityResult called: requestCode=$requestCode, resultCode=$resultCode")
        
        if (requestCode == REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                android.util.Log.d("ScreenCaptureModule", "Permission granted, starting recording")
                startRecording(data)
            } else {
                android.util.Log.w("ScreenCaptureModule", "Permission denied or no data")
                sendEvent("onScreenCaptureError", Arguments.createMap().apply {
                    putString("error", "Permission denied")
                })
            }
        }
    }

    private fun startRecording(data: Intent) {
        try {
            android.util.Log.d("ScreenCaptureModule", "startRecording called")
            android.util.Log.d("ScreenCaptureModule", "Android API level: ${Build.VERSION.SDK_INT}")
            
            // Service should already be running from startScreenCapture
            android.util.Log.d("ScreenCaptureModule", "Creating MediaProjection (service should be running)...")
            mediaProjection = mediaProjectionManager?.getMediaProjection(Activity.RESULT_OK, data)
            android.util.Log.d("ScreenCaptureModule", "MediaProjection created")
            
            // For now, let's just set the recording state without creating a virtual display
            // This will help us identify if the issue is with the virtual display creation
            isRecording = true

            sendEvent("onScreenCaptureStarted", Arguments.createMap().apply {
                putInt("width", 1920) // Default values for now
                putInt("height", 1080)
            })

            android.util.Log.d("ScreenCaptureModule", "Screen capture started successfully (simplified)")

        } catch (e: Exception) {
            android.util.Log.e("ScreenCaptureModule", "Screen capture start error: ${e.message}", e)
            sendEvent("onScreenCaptureError", Arguments.createMap().apply {
                putString("error", e.message ?: "Unknown error")
            })
        }
    }

    private fun stopRecording() {
        try {
            android.util.Log.d("ScreenCaptureModule", "stopRecording called")
            
            // Release virtual display if it exists
            virtualDisplay?.release()
            virtualDisplay = null

            // Stop media projection
            mediaProjection?.stop()
            mediaProjection = null

            // Stop foreground service
            val serviceIntent = Intent(reactContext, ScreenCaptureService::class.java).apply {
                action = ScreenCaptureService.ACTION_STOP_SCREEN_CAPTURE
            }
            reactContext.startService(serviceIntent)
            android.util.Log.d("ScreenCaptureModule", "Foreground service stopped")

            isRecording = false

            sendEvent("onScreenCaptureStopped", Arguments.createMap())
            android.util.Log.d("ScreenCaptureModule", "Screen capture stopped successfully")
        } catch (e: Exception) {
            android.util.Log.e("ScreenCaptureModule", "Screen capture stop error: ${e.message}", e)
            sendEvent("onScreenCaptureError", Arguments.createMap().apply {
                putString("error", e.message ?: "Unknown error")
            })
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        if (isRecording) {
            stopRecording()
        }
        setInstance(null)
    }
}
