export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
    id: number;
    title: string;
    overview: string;
    vote_average: number;
    poster_path?: string;
    release_date: string;
    genre_ids: number[];
}

// Extended interface for detailed movie information from TMDB API
export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  videos: {
    results: Video[];
  };
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}