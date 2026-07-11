import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import { getMediaItems } from '../lib/htmlUtils';

interface MediaCarouselProps {
  imageUrl?: string | null;
  isSensitiveHidden?: boolean;
  onRevealSensitive?: () => void;
  isSensitive?: boolean;
}

const VideoPlayer = ({ url }: { url: string }) => {
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleLoad = (data: any) => {
    setDuration(data.duration || 0);
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime || 0);
  };

  const handleError = () => {
    setError(true);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (error) {
    return (
      <View style={styles.videoError}>
        <Text style={styles.videoErrorText}>Could not load video</Text>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.videoPlayer}
        resizeMode="contain"
        paused={paused}
        muted={muted}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onError={handleError}
        onEnd={() => setPaused(true)}
        repeat={false}
        useTextureView={false}
        controls={false}
      />

      {/* Tap zone - behind controls */}
      <TouchableOpacity
        style={styles.videoTapZone}
        onPress={() => setPaused(p => !p)}
        activeOpacity={1}
      >
        {/* Centre play/pause icon shown when paused */}
        {paused && (
          <View style={styles.centrePlayButton}>
            <Play color="#FFF" size={36} fill="#FFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom controls bar */}
      <View style={styles.videoControls} pointerEvents="box-none">
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setPaused(p => !p)}
          >
            {paused
              ? <Play color="#FFF" size={18} fill="#FFF" />
              : <Pause color="#FFF" size={18} fill="#FFF" />
            }
          </TouchableOpacity>

          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setMuted(m => !m)}
          >
            {muted
              ? <VolumeX color="#FFF" size={16} />
              : <Volume2 color="#FFF" size={16} />
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  imageUrl,
  isSensitiveHidden = false,
  onRevealSensitive,
  isSensitive = false,
}) => {
  const mediaItems = getMediaItems(imageUrl);
  const [index, setIndex] = useState(0);

  if (mediaItems.length === 0) return null;

  const currentMedia = mediaItems[index];

  const handleNext = () => {
    if (index < mediaItems.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View style={styles.container}>
      {isSensitive && isSensitiveHidden ? (
        <TouchableOpacity style={styles.sensitiveGate} onPress={onRevealSensitive}>
          <Text style={styles.sensitiveGateTitle}>Sensitive content</Text>
          <Text style={styles.sensitiveGateText}>Tap to reveal media.</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.mediaWrapper}>
          {currentMedia.type === 'video' ? (
            <VideoPlayer url={currentMedia.url} />
          ) : (
            <Image source={{ uri: currentMedia.url }} style={styles.image} resizeMode="cover" />
          )}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              {index > 0 && (
                <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={handlePrev}>
                  <ChevronLeft color="#FFF" size={24} />
                </TouchableOpacity>
              )}
              {index < mediaItems.length - 1 && (
                <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={handleNext}>
                  <ChevronRight color="#FFF" size={24} />
                </TouchableOpacity>
              )}

              {/* Indicator dots */}
              <View style={styles.dotsContainer}>
                {mediaItems.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === index ? styles.activeDot : null]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Video player
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  videoError: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoErrorText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  videoTapZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 52, // leave space for controls bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  centrePlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    padding: 4,
  },
  timeText: {
    flex: 1,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // Carousel navigation
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: { left: 12 },
  rightArrow: { right: 12 },
  dotsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Sensitive gate
  sensitiveGate: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
  },
  sensitiveGateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  sensitiveGateText: {
    fontSize: 14,
    color: '#1e40af',
  },
});
