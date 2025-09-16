// https://eduplay.rnp.br/app/video/195245
import { forwardRef, useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions, SafeAreaView, StyleSheet, Platform } from 'react-native';
import Styled from './styles';
import Colors from '../../../constants/colors';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const EduPlayer = forwardRef(({ url, playing, playerCurrentTime, isPresenter }, ref) => {
  const webViewRef = useRef();
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  let embedUrl = url;
  const match = url.match(/\/video\/(\d+)$/);
  if (match) {
    embedUrl = url.replace(/\/video\/(\d+)$/, '/video/embed/$1/remote-control');
  }

  const postMessage = (obj) => {
    if (!webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      (function() {
        var iframe = document.getElementById('edu-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(${JSON.stringify(JSON.stringify(obj))}, "*");
        }
      })();
    `);
  };

  useEffect(() => {
    if (!ready) return;
    if (playing) {
      postMessage({ event: 'play' });
    } else {
      postMessage({ event: 'pause' });
    }
  }, [playing, ready]);

  useEffect(() => {
    if (!ready || playerCurrentTime == null) return;
    postMessage({ event: 'seek', playerPosition: playerCurrentTime });
  }, [playerCurrentTime, ready]);

  useEffect(() => {
    if (!ready) return;
    if (muted) {
      postMessage({ event: 'mute' });
    } else {
      postMessage({ event: 'unmute' });
    }
  }, [muted, ready]);

  useEffect(() => {
    if (!ready) return;
    postMessage({ event: 'setVolume', fraction: volume / 100 });
  }, [volume, ready]);

  const toggleMuteIOS = () => setMuted((m) => !m);

  return (
    <Styled.Container>
      <SafeAreaView style={styles.safe}>
        <WebView
          ref={webViewRef}
          style={styles.webview}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
                <body style="margin:0;padding:0;background:black;">
                  <iframe
                    id="edu-iframe"
                    src="${embedUrl}"
                    width="100%"
                    height="${width}"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                  <script>
                    window.addEventListener("message", function(event) {
                      try {
                        var data = JSON.parse(event.data);
                        if (data.event === "onPlay") {
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "play" }));
                        }
                        if (data.event === "onPause") {
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "pause" }));
                        }
                        if (data.event === "onSeek") {
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "seek", time: data.playerPosition }));
                        }
                        if (data.event === "onTime") {
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "time", time: data.playerPosition }));
                        }
                      } catch(e) {}
                    }, false);

                    setTimeout(() => {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "ready" }));
                    }, 1000);
                  </script>
                </body>
              </html>
            `,
          }}
          onMessage={(event) => {
            try {
              const msg = JSON.parse(event.nativeEvent.data);
              if (msg.type === 'ready') setReady(true);
            } catch { }
          }}
        />

        {!isPresenter && (
          <>
            <Styled.Overlay
              pointerEvents="auto"
              onTouchStart={() => setShowVolume((v) => !v)}
              onClick={() => setShowVolume((v) => !v)}
            />

            {Platform.OS === 'ios' ? (
              <Styled.MuteButton onPress={toggleMuteIOS}>
                <MaterialIcons
                  name={muted ? 'volume-off' : 'volume-up'}
                  size={24}
                  color={Colors.white}
                />
              </Styled.MuteButton>
            ) : (
              showVolume && (
                <Styled.VolumeContainer>
                  <Slider
                    style={{ width: 150, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={volume}
                    step={10}
                    thumbTintColor={Colors.lightBlue}
                    minimumTrackTintColor={Colors.lightBlue}
                    maximumTrackTintColor={Colors.lightGray100}
                    onValueChange={setVolume}
                  />
                </Styled.VolumeContainer>
              )
            )}
          </>
        )}
      </SafeAreaView>
    </Styled.Container>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  webview: { flex: 1 },
});

export default EduPlayer;
