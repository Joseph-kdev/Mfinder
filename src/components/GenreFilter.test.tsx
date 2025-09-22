import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Genrefilter from './genrefilter';
import * as moviesService from '@/services/movies';
import type { Genre } from '@/types';
import type { Movie } from '@/types';

vi.mock('@/services/movies', () => ({
  fetchGenres: vi.fn(),
  fetchMoviesByGenre: vi.fn(),
}));

vi.mock('./MovieList', () => ({
  default: ({ movieResults }: { movieResults: Movie[] }) => (
    <div data-testid="movie-list">
      {movieResults?.map((movie) => (
        <div key={movie.id} data-testid={`movie-${movie.id}`}>
          {movie.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

const mockGenres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
];

const mockMoviesResponse = {
  results: [
    {
      id: 1,
      title: 'Action Movie 1',
      overview: 'An action-packed movie',
      poster_path: '/action1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      genre_ids: [28],
    },
    {
      id: 2,
      title: 'Action Movie 2',
      overview: 'Another action movie',
      poster_path: '/action2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.8,
      genre_ids: [28],
    },
  ],
  total_pages: 10,
  total_results: 200,
  page: 1,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('GenreFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderGenreFilter = () => {
    return render(
      <TestWrapper>
        <Genrefilter />
      </TestWrapper>
    );
  };

  describe('Genre Loading', () => {
    it('should display loading skeletons when genres are loading', async () => {
      vi.mocked(moviesService.fetchGenres).mockImplementation(
        () => new Promise(() => {})
      );

      renderGenreFilter();
      const skeletons = document.querySelectorAll('.bg-muted');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display genres when loaded successfully', async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(mockMoviesResponse);

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Adventure')).toBeInTheDocument();
        expect(screen.getByText('Animation')).toBeInTheDocument();
        expect(screen.getByText('Comedy')).toBeInTheDocument();
        expect(screen.getByText('Crime')).toBeInTheDocument();
      });
    });

    it('should display error message when genre loading fails', async () => {
      vi.mocked(moviesService.fetchGenres).mockRejectedValue(new Error('API Error'));

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('"Error fetching genres"')).toBeInTheDocument();
      });
    });
  });

  describe('Genre Selection', () => {
    beforeEach(async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(mockMoviesResponse);
    });

    it('should deselect a genre when clicked again', async () => {
      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
      });

      const actionButton = screen.getByText('Action');
      
      fireEvent.click(actionButton);
      expect(actionButton.closest('button')).toHaveStyle('background-color: rgb(163, 220, 188)');
      
      fireEvent.click(actionButton);
      expect(actionButton.closest('button')).toHaveStyle('background-color: rgba(0, 0, 0, 0)');
    });

    it('should allow multiple genre selection', async () => {
      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Comedy')).toBeInTheDocument();
      });

      const actionButton = screen.getByText('Action');
      const comedyButton = screen.getByText('Comedy');
      
      fireEvent.click(actionButton);
      fireEvent.click(comedyButton);

      expect(actionButton.closest('button')).toHaveStyle('background-color: rgb(163, 220, 188)');
      expect(comedyButton.closest('button')).toHaveStyle('background-color: rgb(163, 220, 188)');
    });

    it('should reset page to 1 when genre selection changes', async () => {
      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
      });

      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);
      const actionButton = screen.getByText('Action');
      fireEvent.click(actionButton);
      const page1Button = screen.getByText('1');
      expect(page1Button.closest('button')).toHaveClass('bg-primary');
    });
  });

  describe('Movie Loading and Display', () => {
    beforeEach(async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
    });

    it('should display movie loading skeletons when fetching movies', async () => {
      vi.mocked(moviesService.fetchMoviesByGenre).mockImplementation(
        () => new Promise(() => {})
      );
      renderGenreFilter();
      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
      });
      const movieSkeletons = document.querySelectorAll('.aspect-\\[2\\/3\\]');
      expect(movieSkeletons.length).toBe(20); 
    });

    it('should display movies when loaded successfully', async () => {
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(mockMoviesResponse);

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByTestId('movie-list')).toBeInTheDocument();
        expect(screen.getByTestId('movie-1')).toBeInTheDocument();
        expect(screen.getByTestId('movie-2')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(mockMoviesResponse);
    });

    it('should display pagination buttons', async () => {
      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
      const buttons = screen.getAllByRole('button');
      const paginationContainer = document.querySelector('.flex.items-center.justify-center.gap-2.my-8');
      expect(paginationContainer).toBeInTheDocument();
      expect(buttons.length).toBeGreaterThan(5);
    });

    it('should navigate to next page when page button is clicked', async () => {
      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);
      expect(page2Button.closest('button')).toHaveClass('bg-primary');
    });

    it('should disable next button when fetching', async () => {
      vi.mocked(moviesService.fetchMoviesByGenre).mockImplementation(
        () => new Promise(() => {})
      );

      renderGenreFilter();

      await waitFor(() => {
        const paginationContainer = document.querySelector('.flex.items-center.justify-center.gap-2.my-8');
        const buttons = paginationContainer?.querySelectorAll('button');
        const lastButton = buttons?.[buttons.length - 1];
        expect(lastButton).toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty genres response', async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue([]);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(mockMoviesResponse);

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Pick by genres:')).toBeInTheDocument();
      });
    });

    it('should handle empty movies response', async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue({
        results: [],
        total_pages: 0,
        total_results: 0,
        page: 1,
      });

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByTestId('movie-list')).toBeInTheDocument();
        expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
      });
    });

    it('should handle undefined movie response', async () => {
      vi.mocked(moviesService.fetchGenres).mockResolvedValue(mockGenres);
      vi.mocked(moviesService.fetchMoviesByGenre).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof moviesService.fetchMoviesByGenre>>);

      renderGenreFilter();

      await waitFor(() => {
        expect(screen.getByText('Pick by genres:')).toBeInTheDocument();
      });
    });
  });
});
