import React, { useState, useRef, useEffect } from 'react';
import { VideoConfig } from '../types';
import { Button } from './Button';

interface VideoActivityProps {
  config: VideoConfig;
  onComplete: () => void;
}

export function VideoActivity({ config, onComplete }: VideoActivityProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [didSeek, setDidSeek] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Safe converter to seconds
  const convertToSeconds = (val: string | number | undefined): number | null => {
    if (val === undefined || val === null || val === '') return null;
    if (typeof val === 'number') return val;
    // Remove "s" if any, e.g. "450s" -> "450"
    const cleaned = val.toString().trim().toLowerCase().replace('s', '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  };

  // Helper to parse time string like "7m30s" or "450s"
  const parseTimeString = (tStr: string): number => {
    const str = tStr.toLowerCase().replace('s', '');
    if (/^\d+$/.test(str)) {
      return parseInt(str, 10);
    }
    let seconds = 0;
    const mMatch = str.match(/(\d+)m/);
    const sMatch = str.match(/(\d+)s/);
    if (mMatch) {
      seconds += parseInt(mMatch[1], 10) * 60;
    }
    if (sMatch) {
      seconds += parseInt(sMatch[1], 10);
    }
    return seconds || parseInt(str, 10) || 0;
  };

  // Helper to detect and extract YouTube info
  const parseYouTube = (url: string) => {
    if (!url) return { isYouTube: false, videoId: null, urlStart: null };
    const str = url.trim();
    
    let videoId: string | null = null;
    let urlStart: number | null = null;
    
    try {
      const parsed = new URL(str);
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.includes('/watch')) {
          videoId = parsed.searchParams.get('v');
        } else if (parsed.pathname.startsWith('/embed/')) {
          videoId = parsed.pathname.split('/')[2];
        } else if (parsed.pathname.startsWith('/v/')) {
          videoId = parsed.pathname.split('/')[2];
        }
        
        const t = parsed.searchParams.get('t') || parsed.searchParams.get('start');
        if (t) {
          urlStart = parseTimeString(t);
        }
      } else if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.substring(1);
        const t = parsed.searchParams.get('t') || parsed.searchParams.get('start');
        if (t) {
          urlStart = parseTimeString(t);
        }
      }
    } catch (e) {
      const match = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (match) videoId = match[1];
      
      const tMatch = str.match(/[?&](?:t|start)=([^"&?\s]+)/i);
      if (tMatch) {
        urlStart = parseTimeString(tMatch[1]);
      }
    }
    
    return {
      isYouTube: !!videoId,
      videoId,
      urlStart
    };
  };

  const { isYouTube, videoId, urlStart } = parseYouTube(config.videoUrl);
  const startSec = convertToSeconds(config.videoStart) ?? urlStart;
  const endSec = convertToSeconds(config.videoEnd);

  const handleReplay = () => {
    setReplayKey(prev => prev + 1);
    setDidSeek(false);
    setHasEnded(false);
    setIsPlaying(false);
  };

  // Seek on play or play initialization for direct MP4
  const handlePlayOrLoaded = () => {
    if (videoRef.current && startSec !== null) {
      if (!didSeek || videoRef.current.currentTime < startSec - 1) {
        videoRef.current.currentTime = startSec;
        setDidSeek(true);
      }
    }
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && endSec !== null) {
      const current = videoRef.current.currentTime;
      if (current >= endSec) {
        videoRef.current.pause();
        setHasEnded(true);
      }
    }
  };

  // YouTube API listener for state changes (e.g. ended/finished)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data) {
          // playerState: 0 means ENDED
          if (data.event === 'onStateChange') {
            const state = data.info;
            if (state === 0) {
              setHasEnded(true);
            } else if (state === 1) {
              setIsPlaying(true);
            } else if (state === 2) {
              setIsPlaying(false);
            }
          } else if (data.event === 'infoDelivery' && data.info) {
            const state = data.info.playerState;
            if (state === 0) {
              setHasEnded(true);
            } else if (state === 1) {
              setIsPlaying(true);
            } else if (state === 2) {
              setIsPlaying(false);
            }
          }
        }
      } catch (err) {
        // Safe to ignore non-JSON messages or other formats
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isYouTube]);

  // Render a clean success/completion screen when video finishes or reaches limits
  if (hasEnded) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[380px] flex-1 gap-6 p-8 bg-white rounded-[24px] border border-primary-light shadow-md text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-[36px] mb-2 font-bold shadow-inner border border-emerald-100">
          ✓
        </div>
        <h3 className="text-[22px] font-bold text-primary-dark font-sans">
          Video portion completed!
        </h3>
        <p className="text-sm text-text-secondary max-w-md font-medium">
          You have watched the required clip for this lesson. You can either replay it or continue to the next part.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2 min-h-[50px]">
          <Button onClick={handleReplay} variant="ghost" className="px-6 py-3 text-base">
            ↩ Replay clip
          </Button>
          <Button onClick={onComplete} variant="primary" className="px-8 py-3 text-base">
            Continue lesson →
          </Button>
        </div>
      </div>
    );
  }

  // Render YouTube Frame Player
  if (isYouTube && videoId) {
    let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
    if (startSec !== null && startSec > 0) {
      embedUrl += `&start=${startSec}`;
    }
    if (endSec !== null && endSec > 0) {
      embedUrl += `&end=${endSec}`;
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-full flex-1 gap-6 pb-8">
        <div className="w-full rounded-[24px] overflow-hidden shadow-lg border border-primary-light aspect-video relative bg-black">
          <iframe
            key={replayKey}
            src={embedUrl}
            title={config.title || "Video Activity"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        
        <p className="text-xs text-text-secondary text-center px-4 max-w-md">
          {startSec ? `Clip starting at ${Math.floor(startSec / 60)}m ${startSec % 60}s` : "Playing video clip."}
          {endSec ? ` and stopping automatically at ${Math.floor(endSec / 60)}m ${endSec % 60}s.` : "."}
        </p>

        <div className="flex items-center gap-3 min-h-[60px]">
          <Button onClick={onComplete} variant="primary">
            Continue lesson →
          </Button>
        </div>
      </div>
    );
  }

  // Fallback to direct MP4 `<video>` player
  return (
    <div className="flex flex-col items-center justify-center w-full h-full flex-1 gap-8 pb-8">
      <div className="w-full rounded-[24px] overflow-hidden shadow-lg border border-primary-light aspect-video relative bg-black/5">
        <video 
          key={replayKey}
          ref={videoRef}
          src={config.videoUrl} 
          poster={config.posterUrl}
          controls={true}
          autoPlay={true}
          onEnded={() => setHasEnded(true)}
          onPlay={handlePlayOrLoaded}
          onLoadedMetadata={handlePlayOrLoaded}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover text-center"
        />
      </div>
      
      {startSec !== null && (
        <p className="text-xs text-text-secondary text-center">
          Clip from {Math.floor(startSec / 60)}m {startSec % 60}s 
          {endSec ? ` to ${Math.floor(endSec / 60)}m ${endSec % 60}s` : ''}
        </p>
      )}

      <div className="flex items-center gap-3 min-h-[60px]">
        <Button onClick={onComplete} variant="primary">
          Continue lesson →
        </Button>
      </div>
    </div>
  );
}
