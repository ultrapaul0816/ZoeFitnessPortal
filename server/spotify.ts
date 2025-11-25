// Spotify Integration - Replit Connector
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Spotify connector not available');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=spotify',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);
  
  const refreshToken = connectionSettings?.settings?.oauth?.credentials?.refresh_token;
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  const clientId = connectionSettings?.settings?.oauth?.credentials?.client_id;
  const expiresIn = connectionSettings.settings?.oauth?.credentials?.expires_in;
  
  if (!connectionSettings || (!accessToken || !clientId || !refreshToken)) {
    throw new Error('Spotify not connected');
  }
  return { accessToken, clientId, refreshToken, expiresIn };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getSpotifyClient() {
  const { accessToken, clientId, refreshToken, expiresIn } = await getAccessToken();

  const spotify = SpotifyApi.withAccessToken(clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn || 3600,
    refresh_token: refreshToken,
  });

  return spotify;
}

// Check if Spotify is connected
export async function isSpotifyConnected(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}

// Curated workout playlists for each week
// These are public Spotify playlists - calm/recovery music
export const workoutPlaylists = [
  {
    week: 1,
    name: "Week 1: Gentle Recovery",
    description: "Calm, relaxing music for your first week of core reconnection",
    spotifyUri: "spotify:playlist:37i9dQZF1DX3Ogo9pFvBkY", // Peaceful Piano
    spotifyId: "37i9dQZF1DX3Ogo9pFvBkY",
    mood: "calm"
  },
  {
    week: 2,
    name: "Week 2: Mindful Movement",
    description: "Gentle beats for stability and breathwork",
    spotifyUri: "spotify:playlist:37i9dQZF1DWZqd5JBER9c9", // Deep Focus
    spotifyId: "37i9dQZF1DWZqd5JBER9c9",
    mood: "focused"
  },
  {
    week: 3,
    name: "Week 3: Building Strength",
    description: "Light energy as you build control and awareness",
    spotifyUri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO", // Peaceful Piano
    spotifyId: "37i9dQZF1DX4sWSpwq3LiO",
    mood: "energizing"
  },
  {
    week: 4,
    name: "Week 4: Align & Activate",
    description: "Motivating yet calm for your alignment work",
    spotifyUri: "spotify:playlist:37i9dQZF1DX9uKNf5jGX6m", // Chill Instrumental Beats
    spotifyId: "37i9dQZF1DX9uKNf5jGX6m",
    mood: "motivating"
  },
  {
    week: 5,
    name: "Week 5: Functional Flow",
    description: "Uplifting music for functional core exercises",
    spotifyUri: "spotify:playlist:37i9dQZF1DX0SM0LYsmbMT", // Yoga & Meditation
    spotifyId: "37i9dQZF1DX0SM0LYsmbMT",
    mood: "flowing"
  },
  {
    week: 6,
    name: "Week 6: Celebrate Strength",
    description: "Empowering music for your final week - you did it!",
    spotifyUri: "spotify:playlist:37i9dQZF1DX0hWmn8d5pRe", // Motivation Mix
    spotifyId: "37i9dQZF1DX0hWmn8d5pRe",
    mood: "empowering"
  }
];

// Get playlist details from Spotify API
export async function getPlaylistDetails(playlistId: string) {
  try {
    const spotify = await getSpotifyClient();
    const playlist = await spotify.playlists.getPlaylist(playlistId);
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images?.[0]?.url,
      trackCount: playlist.tracks.total,
      uri: playlist.uri,
      externalUrl: playlist.external_urls.spotify
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
}

// Get user's current playback state
export async function getPlaybackState() {
  try {
    const spotify = await getSpotifyClient();
    const state = await spotify.player.getPlaybackState();
    if (!state) return null;
    
    return {
      isPlaying: state.is_playing,
      track: state.item ? {
        name: (state.item as any).name,
        artist: (state.item as any).artists?.map((a: any) => a.name).join(', '),
        albumArt: (state.item as any).album?.images?.[0]?.url,
        durationMs: (state.item as any).duration_ms,
        progressMs: state.progress_ms
      } : null,
      device: state.device ? {
        name: state.device.name,
        type: state.device.type,
        volumePercent: state.device.volume_percent
      } : null
    };
  } catch (error) {
    console.error('Error getting playback state:', error);
    return null;
  }
}

// Control playback
export async function controlPlayback(action: 'play' | 'pause' | 'next' | 'previous', contextUri?: string) {
  try {
    const spotify = await getSpotifyClient();
    
    switch (action) {
      case 'play':
        if (contextUri) {
          await spotify.player.startResumePlayback('', contextUri);
        } else {
          await spotify.player.startResumePlayback('');
        }
        break;
      case 'pause':
        await spotify.player.pausePlayback('');
        break;
      case 'next':
        await spotify.player.skipToNext('');
        break;
      case 'previous':
        await spotify.player.skipToPrevious('');
        break;
    }
    return { success: true };
  } catch (error: any) {
    console.error('Playback control error:', error);
    return { success: false, error: error.message };
  }
}
