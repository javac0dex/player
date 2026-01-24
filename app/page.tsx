'use client';

import React from "react"
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipBack, SkipForward, Settings } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Quality label helper
  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'auto':
        return 'Auto';
      case '144p':
        return '144p';
      case '240p':
        return '240p';
      case '360p':
        return '360p';
      case '480p':
        return '480p';
      case '720p':
        return '720p';
      case '1080p':
        return '1080p';
      case '1440p':
        return '1440p';
      case '2160p':
        return '2160p';
      default:
        return quality;
    }
  };

  // Full quality display helper
  const getFullQualityDisplay = (quality: string) => {
    return quality === 'auto' ? 'Auto' : `${quality}p`;
  };

  // Initialize YouTube Player
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Define onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      const videoId = 'c7G0npP9jnw';
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          controls: 0, // Hide YouTube controls
          fs: 0, // Disable fullscreen button
          iv_load_policy: 3, // Hide annotations
          modestbranding: 1,
          rel: 0, // Don't show related videos
          disablekb: 1, // Disable keyboard controls
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onPlaybackQualityChange: onPlaybackQualityChange,
        },
      });
    };

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, []);

  const onPlayerReady = () => {
    setIsLoaded(true);
    setDuration(playerRef.current.getDuration());
    setVolume(playerRef.current.getVolume());
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      // Update progress bar while playing
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = setInterval(() => {
        setCurrentTime(playerRef.current.getCurrentTime());
      }, 100);
    } else {
      setIsPlaying(false);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    }
  };

  const onPlaybackQualityChange = (event: any) => {
    setCurrentQuality(event.data);
  };

  // Play/Pause toggle
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  // Mute toggle
  const handleMuteToggle = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  // Progress bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  // Skip forward/backward
  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = playerRef.current.getCurrentTime() + seconds;
      playerRef.current.seekTo(newTime);
    }
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Quality change handler
  const handleQualityChange = (quality: string) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackQuality(quality);
    }
    setShowQualityMenu(false);
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Prevent right click and other interactions
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Custom YouTube Player</h1>
          <p className="text-slate-300">YouTube dengan Kontrol Custom Penuh</p>
        </div>

        {/* Video Player Container */}
        <div
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden shadow-2xl group aspect-video"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
        >
          {/* YouTube Player */}
          <div id="youtube-player" className="w-full h-full select-none pointer-events-none" />

          {/* Protective Overlay - Blocks direct interaction with YouTube player */}
          <div className="absolute inset-0 z-20 pointer-events-auto" />

          {/* Loading State */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-slate-600 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Watermark */}
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <div className="bg-black/60 hover:bg-black/80 transition-all px-3 py-1.5 rounded">
              <span className="text-white text-sm font-semibold">videoplayeryt.com</span>
            </div>
          </div>

          {/* Play Button Overlay (saat video paused) */}
          {!isPlaying && isLoaded && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all z-30"
            >
              <div className="bg-red-600 p-6 rounded-full hover:bg-red-700 transition-colors">
                <Play size={48} className="text-white fill-white" />
              </div>
            </button>
          )}

          {/* Controls Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 z-40 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-red-600 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Skip Buttons */}
                <button
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-red-600 transition-colors"
                  title="Rewind 10s"
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-red-600 transition-colors"
                  title="Forward 10s"
                >
                  <SkipForward size={24} />
                </button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-red-600 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                    title="Volume"
                  />
                  <span className="text-xs text-slate-300 w-8">{isMuted ? '0' : volume}%</span>
                </div>
              </div>

              {/* Right Controls */}
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-red-600 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Fitur Custom Player</h2>
          <ul className="text-slate-300 space-y-2">
            <li>✓ Play/Pause dengan tombol custom</li>
            <li>✓ Volume control dan mute</li>
            <li>✓ Progress bar untuk seeking</li>
            <li>✓ Tombol skip forward/backward (10 detik)</li>
            <li>✓ Fullscreen mode</li>
            <li>✓ Kualitas otomatis dari YouTube</li>
            <li>✓ Klik kanan diblokir - tidak ada akses ke fitur YouTube</li>
            <li>✓ Overlay transparan melindungi player - penonton hanya bisa menggunakan tombol web Anda</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
