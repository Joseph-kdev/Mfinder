import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import MovieDetails from './MovieDetails';
import * as moviesService from '@/services/movies';
import type { MovieDetails as MovieDetailsType } from '@/types';

vi.mock('@/services/movies', () => ({
  fetchMovieDetails: vi.fn(),
}));

vi.mock('@/components/navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/SimilarMovies', () => ({
  default: ({ movieId }: { movieId: string }) => (
    <div data-testid="similar-movies" data-movie-id={movieId}>
      Similar Movies
    </div>
  ),
}));

vi.mock('react-spinners', () => ({
  ClimbingBoxLoader: ({ size }: { size: number }) => (
    <div data-testid="climbing-box-loader" data-size={size}>
      Loading...
    </div>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '550' }),
  };
});

const mockMovieDetails: MovieDetailsType = {
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

const renderMovieDetails = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MovieDetails />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MovieDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovieDetails);
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      vi.mocked(moviesService.fetchMovieDetails).mockImplementation(
        () => new Promise(() => {})
      );
      renderMovieDetails();
      expect(screen.getByTestId('climbing-box-loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when API fails', async () => {
      vi.mocked(moviesService.fetchMovieDetails).mockRejectedValue(
        new Error('API Error')
      );
      renderMovieDetails();
      await waitFor(() => {
        expect(screen.getByText('Error fetching movie details')).toBeInTheDocument();
      });
    });
  });

  describe('Movie Details Rendering', () => {
    beforeEach(async () => {
      renderMovieDetails();
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeInTheDocument();
      });
    });
    it('should display movie poster', () => {
      const poster = screen.getByAltText('Fight Club');
      expect(poster).toBeInTheDocument();
      expect(poster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
    });

    it('should display movie title', () => {
      expect(screen.getByText('Fight Club')).toBeInTheDocument();
    });

    it('should display movie overview', () => {
      expect(screen.getByText(mockMovieDetails.overview)).toBeInTheDocument();
    });

    it('should display movie genres', () => {
      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Thriller')).toBeInTheDocument();
      expect(screen.getByText('Comedy')).toBeInTheDocument();
    });

    it('should display runtime', () => {
      expect(screen.getByText('139m')).toBeInTheDocument();
    });

    it('should display release year', () => {
      expect(screen.getByText('1999')).toBeInTheDocument();
    });

    it('should display cast section', () => {
      expect(screen.getByText('Cast')).toBeInTheDocument();
    });

    it('should display cast members', () => {
      expect(screen.getByText('Edward Norton')).toBeInTheDocument();
      expect(screen.getByText('Brad Pitt')).toBeInTheDocument();
    });

    it('should display trailer section', () => {
      expect(screen.getByText('Trailer')).toBeInTheDocument();
    });


    it('should render similar movies component', () => {
      const similarMovies = screen.getByTestId('similar-movies');
      expect(similarMovies).toBeInTheDocument();
      expect(similarMovies).toHaveAttribute('data-movie-id', '550');
    });
  });

  describe('Edge Cases', () => {
    it('should handle movie without poster', async () => {
      const movieWithoutPoster = { ...mockMovieDetails, poster_path: undefined };
      vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(movieWithoutPoster);

      renderMovieDetails();

      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeInTheDocument();
      });

      const poster = screen.getByAltText('Fight Club');
      expect(poster).toHaveAttribute('src', expect.stringContaining('placehold.co'));
    });

    it('should handle movie without trailer', async () => {
      const movieWithoutTrailer = {
        ...mockMovieDetails,
        videos: { results: [] }
      };
      vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(movieWithoutTrailer);
      renderMovieDetails();
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeInTheDocument();
      });
      expect(screen.getByText('No trailer available')).toBeInTheDocument();
    });
  });
});
