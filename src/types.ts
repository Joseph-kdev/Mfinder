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