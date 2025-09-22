// src/services/movieServices.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGenres, fetchMoviesByGenre, searchMovies, fetchMovieDetails, fetchSimilarMovies } from './movies';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

// Mock fetch globally
vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({} as Response));

// Mock sessionStorage on the global object
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Movie Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
    vi.spyOn(global, 'fetch').mockReset();
  });

  describe('fetchGenres', () => {
    const mockGenresData = {
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ],
    };

    it('should fetch genres from API and cache them when no cache exists', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGenresData,
      } as Response);

      const result = await fetchGenres();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/genre/movie/list',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '), // Partial match for key
            'Content-Type': 'application/json',
          },
        }
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'movieGenres',
        JSON.stringify(mockGenresData.genres)
      );
      expect(result).toEqual(mockGenresData.genres);
    });

    it('should return cached genres when available', async () => {
      const cachedData = JSON.stringify(mockGenresData.genres);
      mockSessionStorage.getItem.mockReturnValue(cachedData);

      const result = await fetchGenres();

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('movieGenres');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockGenresData.genres);
    });

    it('should throw error on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(fetchGenres()).rejects.toThrow('HTTP error! status: 401');
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should log and rethrow network error', async () => {
      const mockError = new Error('Network failure');
      global.fetch.mockRejectedValueOnce(mockError);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(fetchGenres()).rejects.toThrow('Network failure');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching genres:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('fetchMoviesByGenre', () => {
    const mockMoviesData = {
      results: [
        { id: 1, title: 'Test Movie 1' },
        { id: 2, title: 'Test Movie 2' },
      ],
      page: 1,
    };

    it('should fetch movies with selected genres and return data', async () => {
      const params = { selectedGenres: [28, 12], page: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoviesData,
      } as Response);

      const result = await fetchMoviesByGenre(params);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&with_genres=28,12&page=1',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockMoviesData);
    });

    it('should fetch movies without genre filter when none selected', async () => {
      const params = { selectedGenres: [], page: 2 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMoviesData,
      } as Response);

      const result = await fetchMoviesByGenre(params);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&page=2',
        expect.any(Object)
      );
      expect(result).toEqual(mockMoviesData);
    });

    it('should throw error on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const params = { selectedGenres: [28], page: 1 };
      await expect(fetchMoviesByGenre(params)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should log and rethrow network error', async () => {
      const mockError = new Error('Fetch failed');
      global.fetch.mockRejectedValueOnce(mockError);

      const params = { selectedGenres: [28], page: 1 };
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(fetchMoviesByGenre(params)).rejects.toThrow('Fetch failed');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching movies:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('searchMovies', () => {
    const mockSearchData = {
      results: [
        { id: 1, title: 'Avengers: Endgame', overview: 'Epic superhero movie' },
        { id: 2, title: 'Avengers: Infinity War', overview: 'Another epic movie' },
      ],
      total_pages: 5,
      total_results: 100,
      page: 1,
    };

    it('should search movies with query and default page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData,
      } as Response);

      const result = await searchMovies('avengers');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/movie?query=avengers&page=1',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockSearchData);
    });

    it('should search movies with query and specific page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData,
      } as Response);

      const result = await searchMovies('spider-man', 2);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/movie?query=spider-man&page=2',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockSearchData);
    });

    it('should encode special characters in query', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData,
      } as Response);

      const result = await searchMovies('fast & furious');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/movie?query=fast%20%26%20furious&page=1',
        expect.any(Object)
      );
      expect(result).toEqual(mockSearchData);
    });

    it('should return empty results for empty query', async () => {
      const result = await searchMovies('');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    });

    it('should return empty results for whitespace-only query', async () => {
      const result = await searchMovies('   ');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    });

    it('should throw error on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(searchMovies('nonexistent')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should log and rethrow network error', async () => {
      const mockError = new Error('Network failure');
      global.fetch.mockRejectedValueOnce(mockError);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(searchMovies('test')).rejects.toThrow('Network failure');
      expect(consoleSpy).toHaveBeenCalledWith('Error searching movies:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle API rate limiting error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      await expect(searchMovies('popular movie')).rejects.toThrow('HTTP error! status: 429');
    });

    it('should handle unauthorized error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(searchMovies('test')).rejects.toThrow('HTTP error! status: 401');
    });
  });

  describe('fetchMovieDetails', () => {
    const mockMovieDetails = {
      id: 550,
      title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      vote_average: 8.433,
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      release_date: '1999-10-15',
      runtime: 139,
      genres: [
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' },
        { id: 35, name: 'Comedy' }
      ],
      videos: {
        results: [
          {
            id: '533ec654c3a36854480003eb',
            key: 'SUXWAEX2jlg',
            name: 'Fight Club | #TBT Trailer | 20th Century FOX',
            site: 'YouTube',
            type: 'Trailer',
            official: false
          }
        ]
      },
      credits: {
        cast: [
          {
            id: 819,
            name: 'Edward Norton',
            character: 'The Narrator',
            profile_path: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg',
            order: 0
          },
          {
            id: 287,
            name: 'Brad Pitt',
            character: 'Tyler Durden',
            profile_path: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg',
            order: 1
          }
        ],
        crew: [
          {
            id: 7467,
            name: 'David Fincher',
            job: 'Director',
            department: 'Directing',
            profile_path: '/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg'
          }
        ]
      }
    };

    it('should fetch movie details with videos and credits appended', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovieDetails,
      } as Response);

      const result = await fetchMovieDetails('550');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550?append_to_response=videos,credits',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockMovieDetails);
    });

    it('should handle string ID parameter correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovieDetails,
      } as Response);

      await fetchMovieDetails('123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/123?append_to_response=videos,credits',
        expect.any(Object)
      );
    });

    it('should throw error on HTTP 404 (movie not found)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(fetchMovieDetails('999999')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw error on HTTP 401 (unauthorized)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(fetchMovieDetails('550')).rejects.toThrow('HTTP error! status: 401');
    });

    it('should log and rethrow network error', async () => {
      const mockError = new Error('Network failure');
      global.fetch.mockRejectedValueOnce(mockError);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(fetchMovieDetails('550')).rejects.toThrow('Network failure');
      expect(consoleSpy).toHaveBeenCalledWith('Error searching movies:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle movie with no videos or credits', async () => {
      const movieWithoutExtras = {
        ...mockMovieDetails,
        videos: { results: [] },
        credits: { cast: [], crew: [] }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => movieWithoutExtras,
      } as Response);

      const result = await fetchMovieDetails('550');
      expect(result.videos.results).toHaveLength(0);
      expect(result.credits.cast).toHaveLength(0);
    });
  });

  describe('fetchSimilarMovies', () => {
    const mockSimilarMovies = {
      page: 1,
      results: [
        {
          id: 807,
          title: 'Se7en',
          overview: 'Two homicide detectives are on a desperate hunt for a serial killer...',
          vote_average: 8.374,
          poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
          release_date: '1995-09-22',
          genre_ids: [18, 80, 9648, 53]
        },
        {
          id: 155,
          title: 'The Dark Knight',
          overview: 'Batman raises the stakes in his war on crime...',
          vote_average: 8.516,
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          release_date: '2008-07-16',
          genre_ids: [18, 28, 80, 53]
        }
      ],
      total_pages: 5,
      total_results: 100
    };

    it('should fetch similar movies with default page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSimilarMovies,
      } as Response);

      const result = await fetchSimilarMovies('550');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550/similar?page=1',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockSimilarMovies);
    });

    it('should fetch similar movies with specific page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSimilarMovies,
      } as Response);

      const result = await fetchSimilarMovies('550', 2);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550/similar?page=2',
        {
          headers: {
            Authorization: expect.stringContaining('Bearer '),
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockSimilarMovies);
    });

    it('should handle empty similar movies results', async () => {
      const emptyResults = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResults,
      } as Response);

      const result = await fetchSimilarMovies('999999');
      expect(result.results).toHaveLength(0);
    });

    it('should throw error on HTTP 404 (movie not found)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(fetchSimilarMovies('999999')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw error on HTTP 401 (unauthorized)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(fetchSimilarMovies('550')).rejects.toThrow('HTTP error! status: 401');
    });

    it('should log and rethrow network error', async () => {
      const mockError = new Error('Network failure');
      global.fetch.mockRejectedValueOnce(mockError);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(fetchSimilarMovies('550')).rejects.toThrow('Network failure');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching similar movies:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle rate limiting error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      await expect(fetchSimilarMovies('550')).rejects.toThrow('HTTP error! status: 429');
    });

    it('should handle server error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchSimilarMovies('550')).rejects.toThrow('HTTP error! status: 500');
    });
  });
});