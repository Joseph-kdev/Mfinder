import { useQuery } from "@tanstack/react-query";
import { fetchSimilarMovies } from "@/services/movies";
import MovieList from "./MovieList";
import { ClimbingBoxLoader } from "react-spinners";

interface SimilarMoviesProps {
  movieId: string;
}

export default function SimilarMovies({ movieId }: SimilarMoviesProps) {
  const {
    data: similarMoviesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [`similar-movies-${movieId}`],
    queryFn: () => fetchSimilarMovies(movieId),
    enabled: !!movieId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <ClimbingBoxLoader size={20} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Failed to load similar movies. Please try again later.
        </p>
      </div>
    );
  }

  if (!similarMoviesData?.results || similarMoviesData.results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No similar movies found.
        </p>
      </div>
    );
  }

  // Limit to first 10 similar movies for better performance and UI
  const limitedResults = similarMoviesData.results.slice(0, 10);

  return (
    <div className="mt-8">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
        You may also like
      </h2>
      <MovieList movieResults={limitedResults} />
    </div>
  );
}
