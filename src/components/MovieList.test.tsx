import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MovieList from "./MovieList";
import type { Movie } from "@/types";

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      onHoverStart,
      onHoverEnd,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      onHoverStart?: () => void;
      onHoverEnd?: () => void;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <div
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    ),
    img: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <img {...props}>{children}</img>,
    h3: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <h3 {...props}>{children}</h3>,
    p: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("usehooks-ts", () => ({
  useOnClickOutside: vi.fn(),
}));

Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Test Movie 1",
    overview:
      "This is a test movie with a longer overview to test text display and truncation behavior.",
    poster_path: "/test1.jpg",
    release_date: "2023-01-15",
    vote_average: 8.5,
    genre_ids: [28, 12],
  },
  {
    id: 2,
    title: "Another Test Movie",
    overview: "Another test movie for testing purposes.",
    poster_path: "/test2.jpg",
    release_date: "2023-02-20",
    vote_average: 7.2,
    genre_ids: [35, 18],
  },
  {
    id: 3,
    title: "Movie Without Poster",
    overview: "This movie has no poster to test fallback behavior.",
    poster_path: null,
    release_date: "2023-03-10",
    vote_average: 6.8,
    genre_ids: [16, 10751],
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe("MovieList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderMovieList = (movies = mockMovies) => {
    return render(
      <TestWrapper>
        <MovieList movieResults={movies} />
      </TestWrapper>
    );
  };

  describe("Basic Rendering", () => {
    it("should render all movies in the list", async () => {
      renderMovieList();

      expect(screen.getByAltText("Test Movie 1")).toBeInTheDocument();
      expect(screen.getByAltText("Another Test Movie")).toBeInTheDocument();
      expect(screen.getByAltText("Movie Without Poster")).toBeInTheDocument();
    });

    it("should render empty list when no movies provided", () => {
      renderMovieList([]);

      const container = document.querySelector(".grid");
      expect(container).toBeInTheDocument();
      expect(container?.children).toHaveLength(0);
    });
  });

  describe("Movie Card Display", () => {
    it("should display movie posters with correct src", () => {
      renderMovieList();

      const poster1 = screen.getByAltText("Test Movie 1");
      expect(poster1).toHaveAttribute(
        "src",
        "https://image.tmdb.org/t/p/w500/test1.jpg"
      );

      const poster2 = screen.getByAltText("Another Test Movie");
      expect(poster2).toHaveAttribute(
        "src",
        "https://image.tmdb.org/t/p/w500/test2.jpg"
      );
    });

    it("should display placeholder for movies without poster", () => {
      renderMovieList();

      const posterWithoutImage = screen.getByAltText("Movie Without Poster");
      expect(posterWithoutImage).toHaveAttribute(
        "src",
        "https://placehold.co/400x600/1a1a1a/FFFFFF.png"
      );
    });

    it("should display movie ratings with star icons after images load", async () => {
      renderMovieList();

      // Initially ratings should not be visible
      expect(screen.queryByText("8.5")).not.toBeInTheDocument();
      expect(screen.queryByText("7.2")).not.toBeInTheDocument();
      expect(screen.queryByText("6.8")).not.toBeInTheDocument();

      // Simulate image loading
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        img.dispatchEvent(new Event("load"));
      });

      // Now ratings should be visible
      expect(await screen.findByText("8.5")).toBeInTheDocument();
      expect(screen.getByText("7.2")).toBeInTheDocument();
      expect(screen.getByText("6.8")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper alt text for movie posters", () => {
      renderMovieList();

      expect(screen.getByAltText("Test Movie 1")).toBeInTheDocument();
      expect(screen.getByAltText("Another Test Movie")).toBeInTheDocument();
      expect(screen.getByAltText("Movie Without Poster")).toBeInTheDocument();
    });
  });
});
