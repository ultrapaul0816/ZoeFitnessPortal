import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, SkipBack, ExternalLink, Headphones, Volume2 } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";

interface WorkoutPlaylist {
  week: number;
  name: string;
  description: string;
  spotifyUri: string;
  spotifyId: string;
  mood: string;
}

interface PlaybackState {
  isPlaying: boolean;
  track: {
    name: string;
    artist: string;
    albumArt: string;
    durationMs: number;
    progressMs: number;
  } | null;
  device: {
    name: string;
    type: string;
    volumePercent: number;
  } | null;
}

interface SpotifyWidgetProps {
  currentWeek: number;
}

export function SpotifyWidget({ currentWeek }: SpotifyWidgetProps) {
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if Spotify is connected
  const { data: spotifyStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/spotify/status"],
    refetchInterval: 30000,
  });

  // Get workout playlists
  const { data: playlists } = useQuery<WorkoutPlaylist[]>({
    queryKey: ["/api/spotify/workout-playlists"],
    enabled: spotifyStatus?.connected === true,
  });

  // Get current playback state
  const { data: playback, refetch: refetchPlayback } = useQuery<PlaybackState>({
    queryKey: ["/api/spotify/playback"],
    enabled: spotifyStatus?.connected === true && isExpanded,
    refetchInterval: isExpanded ? 5000 : false,
  });

  // Playback control mutation
  const controlMutation = useMutation({
    mutationFn: async ({ action, contextUri }: { action: string; contextUri?: string }) => {
      return apiRequest("POST", `/api/spotify/playback/${action}`, { contextUri });
    },
    onSuccess: () => {
      setTimeout(() => refetchPlayback(), 500);
    },
  });

  const currentPlaylist = playlists?.find(p => p.week === currentWeek);

  // If Spotify not connected, show minimal button
  if (!spotifyStatus?.connected) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
        <SiSpotify className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Spotify not connected</span>
      </div>
    );
  }

  const handlePlayPlaylist = (playlist: WorkoutPlaylist) => {
    controlMutation.mutate({ action: "play", contextUri: playlist.spotifyUri });
    setShowPlaylistDialog(false);
    setIsExpanded(true);
  };

  return (
    <>
      {/* Compact Music Widget */}
      <Card className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transition-all ${isExpanded ? 'shadow-md' : ''}`}>
        <CardContent className="p-3">
          {/* Header with Spotify branding */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SiSpotify className="w-5 h-5 text-[#1DB954]" />
              <span className="text-sm font-medium text-gray-700">Workout Music</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylistDialog(true)}
              className="h-7 px-2 text-xs text-green-700 hover:bg-green-100"
              data-testid="button-browse-playlists"
            >
              <Music className="w-3 h-3 mr-1" />
              Playlists
            </Button>
          </div>

          {/* Current Week Playlist */}
          {currentPlaylist && (
            <div 
              className="flex items-center gap-3 p-2 bg-white/70 rounded-lg cursor-pointer hover:bg-white transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="spotify-current-playlist"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{currentPlaylist.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentPlaylist.description}</p>
              </div>
              {playback?.isPlaying ? (
                <div className="flex items-center gap-1">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(currentPlaylist);
                  }}
                  data-testid="button-play-current-playlist"
                >
                  <Play className="w-4 h-4 ml-0.5" fill="white" />
                </Button>
              )}
            </div>
          )}

          {/* Expanded Player Controls */}
          {isExpanded && playback?.track && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center gap-3">
                {playback.track.albumArt && (
                  <img 
                    src={playback.track.albumArt} 
                    alt="Album art" 
                    className="w-12 h-12 rounded-lg shadow-sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{playback.track.name}</p>
                  <p className="text-xs text-gray-500 truncate">{playback.track.artist}</p>
                </div>
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  onClick={() => controlMutation.mutate({ action: "previous" })}
                  disabled={controlMutation.isPending}
                  data-testid="button-spotify-previous"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white"
                  onClick={() => controlMutation.mutate({ action: playback.isPlaying ? "pause" : "play" })}
                  disabled={controlMutation.isPending}
                  data-testid="button-spotify-play-pause"
                >
                  {playback.isPlaying ? (
                    <Pause className="w-5 h-5" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  onClick={() => controlMutation.mutate({ action: "next" })}
                  disabled={controlMutation.isPending}
                  data-testid="button-spotify-next"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Device Info */}
              {playback.device && (
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                  <Volume2 className="w-3 h-3" />
                  <span>Playing on {playback.device.name}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playlist Browser Dialog */}
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SiSpotify className="w-5 h-5 text-[#1DB954]" />
              Workout Playlists
            </DialogTitle>
            <DialogDescription>
              Curated music for each week of your program
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3 py-2">
              {playlists?.map((playlist) => (
                <div 
                  key={playlist.week}
                  className={`p-3 rounded-lg border transition-colors ${
                    playlist.week === currentWeek 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  data-testid={`playlist-week-${playlist.week}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          playlist.week === currentWeek 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          Week {playlist.week}
                        </span>
                        {playlist.week === currentWeek && (
                          <span className="text-xs text-green-600 font-medium">Current</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">{playlist.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{playlist.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white"
                        onClick={() => handlePlayPlaylist(playlist)}
                        data-testid={`button-play-week-${playlist.week}`}
                      >
                        <Play className="w-4 h-4 ml-0.5" fill="white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                        asChild
                      >
                        <a 
                          href={`https://open.spotify.com/playlist/${playlist.spotifyId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid={`link-spotify-week-${playlist.week}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              Opens in Spotify app. Premium required for full playback control.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
