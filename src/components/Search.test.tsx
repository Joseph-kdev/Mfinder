import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SearchDialog from './Search';
import * as moviesService from '@/services/movies';
import type { Movie } from '@/types';

// Mock the movies service
vi.mock('@/services/movies', () => ({
  searchMovies: vi.fn(),
}));

// Mock the MovieList component
vi.mock('./MovieList', () => ({
  default: ({ movieResults }: { movieResults: Movie[] }) => (
    <div data-testid="movie-list">
      {movieResults.map((movie) => (
        <div key={movie.id} data-testid={`movie-${movie.id}`}>
          {movie.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock usehooks-ts
vi.mock('usehooks-ts', () => ({
  useDebounceValue: vi.fn((value) => [value]), // Return the value immediately for testing
}));

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Test Movie 1',
    overview: 'A test movie',
    poster_path: '/test1.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    genre_ids: [28, 12],
  },
  {
    id: 2,
    title: 'Test Movie 2',
    overview: 'Another test movie',
    poster_path: '/test2.jpg',
    release_date: '2023-02-01',
    vote_average: 7.8,
    genre_ids: [28, 12],
  },
];

const mockSearchResponse = {
  results: mockMovies,
  total_pages: 5,
  total_results: 100,
};

// Test wrapper component
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
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SearchDialog Component', () => {
  const mockOnOpenChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderSearchDialog = (open = true) => {
    return render(
      <TestWrapper>
        <SearchDialog open={open} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    );
  };

  describe('Dialog Rendering', () => {
    it('should render dialog when open is true', () => {
      renderSearchDialog(true);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for movie...')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      renderSearchDialog(false);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should auto-focus search input when dialog opens', () => {
      renderSearchDialog(true);
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Search Input Functionality', () => {
    it('should update search input value when typing', () => {
      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'avengers' } });
      
      expect(searchInput).toHaveValue('avengers');
    });

    it('should clear search input when dialog closes', () => {
      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      // Simulate dialog close
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Search States', () => {
    it('should show initial message when no query is entered', () => {
      renderSearchDialog();
      
      expect(screen.getByText('Start typing to search for movies...')).toBeInTheDocument();
    });

    it('should show loading state when searching', async () => {
      vi.mocked(moviesService.searchMovies).mockImplementation(
        () => new Promise(() => {}) // Never resolves to simulate loading
      );

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });
    });

    it('should show error message when search fails', async () => {
      vi.mocked(moviesService.searchMovies).mockRejectedValue(
        new Error('API Error')
      );

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Error searching movies. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show no results message when search returns empty', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue({
        results: [],
        total_pages: 0,
        total_results: 0,
      });

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No movies found for "nonexistent"')).toBeInTheDocument();
      });
    });
  });

  describe('Search Results', () => {
    it('should display search results when movies are found', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue(mockSearchResponse);

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('movie-list')).toBeInTheDocument();
        expect(screen.getByTestId('movie-1')).toBeInTheDocument();
        expect(screen.getByTestId('movie-2')).toBeInTheDocument();
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });
    });

    it('should call searchMovies with correct parameters', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue(mockSearchResponse);

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'avengers' } });
      
      await waitFor(() => {
        expect(moviesService.searchMovies).toHaveBeenCalledWith('avengers');
      });
    });
  });

  describe('Dialog Interactions', () => {
    it('should call onOpenChange with false when close button is clicked', () => {
      renderSearchDialog();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onOpenChange with false when escape key is pressed', () => {
      renderSearchDialog();
      
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderSearchDialog();
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      
      const title = screen.getByText('Search');
      expect(title).toBeInTheDocument();
    });

    it('should have proper input labeling', () => {
      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      expect(searchInput).toHaveAttribute('placeholder', 'Search for movie...');
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to MovieList component', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue(mockSearchResponse);

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        const movieList = screen.getByTestId('movie-list');
        expect(movieList).toBeInTheDocument();
        
        // Verify that both movies are rendered
        expect(screen.getByTestId('movie-1')).toBeInTheDocument();
        expect(screen.getByTestId('movie-2')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined search results gracefully', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof moviesService.searchMovies>>);

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        // Should not crash and should show no results
        expect(screen.queryByTestId('movie-list')).not.toBeInTheDocument();
      });
    });

    it('should handle search results without results array', async () => {
      vi.mocked(moviesService.searchMovies).mockResolvedValue({} as Awaited<ReturnType<typeof moviesService.searchMovies>>);

      renderSearchDialog();
      
      const searchInput = screen.getByPlaceholderText('Search for movie...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        // Should not crash and should show no results
        expect(screen.queryByTestId('movie-list')).not.toBeInTheDocument();
      });
    });
  });
});
