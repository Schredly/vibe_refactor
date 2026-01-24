import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface MusicTrack {
  id: string;
  name: string;
  description: string;
  url: string;
}

const musicTracks: MusicTrack[] = [
  {
    id: "ambient",
    name: "Ambient Focus",
    description: "Soft ambient tones",
    url: "https://cdn.pixabay.com/audio/2024/11/01/audio_24b68fe8c6.mp3",
  },
  {
    id: "lofi",
    name: "Lo-Fi Chill",
    description: "Relaxing lo-fi beats",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  },
  {
    id: "piano",
    name: "Gentle Piano",
    description: "Soft piano melodies",
    url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
  },
  {
    id: "nature",
    name: "Nature Sounds",
    description: "Forest and stream",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4deeb28f8c.mp3",
  },
  {
    id: "meditation",
    name: "Meditation",
    description: "Deep relaxation tones",
    url: "https://cdn.pixabay.com/audio/2024/09/10/audio_6e5d7d1912.mp3",
  },
];

export function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;
    
    audioRef.current.addEventListener("canplaythrough", () => {
      setIsLoading(false);
    });
    
    audioRef.current.addEventListener("error", () => {
      setIsLoading(false);
      setIsPlaying(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTrackChange = (trackId: string) => {
    const track = musicTracks.find((t) => t.id === trackId);
    if (!track || !audioRef.current) return;

    setSelectedTrack(trackId);
    setIsLoading(true);
    
    audioRef.current.pause();
    audioRef.current.src = track.url;
    audioRef.current.load();
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (!selectedTrack) {
      const firstTrack = musicTracks[0];
      setSelectedTrack(firstTrack.id);
      setIsLoading(true);
      audioRef.current.src = firstTrack.url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentTrack = musicTracks.find((t) => t.id === selectedTrack);

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 border" data-testid="music-player">
      <Music className="w-4 h-4 text-muted-foreground shrink-0" />
      
      <Select value={selectedTrack} onValueChange={handleTrackChange}>
        <SelectTrigger 
          className="w-[160px] h-8 text-sm" 
          data-testid="select-music-type"
        >
          <SelectValue placeholder="Choose music..." />
        </SelectTrigger>
        <SelectContent>
          {musicTracks.map((track) => (
            <SelectItem 
              key={track.id} 
              value={track.id}
              data-testid={`music-option-${track.id}`}
            >
              <div className="flex flex-col">
                <span>{track.name}</span>
                <span className="text-xs text-muted-foreground">{track.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="icon"
        variant={isPlaying ? "default" : "ghost"}
        onClick={togglePlayPause}
        disabled={isLoading}
        data-testid="button-music-play"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={toggleMute}
        data-testid="button-music-mute"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      <Slider
        value={[isMuted ? 0 : volume]}
        onValueChange={(value) => {
          setVolume(value[0]);
          if (isMuted && value[0] > 0) setIsMuted(false);
        }}
        max={100}
        step={5}
        className="w-20"
        data-testid="slider-music-volume"
      />

      {isPlaying && currentTrack && (
        <span className="text-xs text-muted-foreground hidden sm:block">
          Now playing: {currentTrack.name}
        </span>
      )}
    </div>
  );
}
