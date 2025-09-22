import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { fetchMovieDetails } from "@/services/movies";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
import { motion } from "motion/react";
import SimilarMovies from "@/components/SimilarMovies";
import type { MovieDetails, Video } from "@/types";

export default function MovieDetails() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const formatRuntime = (minutes: number | undefined ) => {
    if(!minutes) return "";
    return `${minutes}m`;
  };

  const formatYear = (dateString: string | undefined ) => {
    if(!dateString) return "";
    return new Date(dateString).getFullYear();
  };

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery<MovieDetails>({
    queryKey: [`movie-${id}`],
    queryFn: () => fetchMovieDetails(id),
  });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        const maxDrag = Math.max(0, contentWidth - containerWidth);
        setDragConstraints({ left: -maxDrag, right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [movie, isLoading]);

  let officialTrailer: Video | undefined;

  if (movie) {
    officialTrailer = movie.videos.results.find(
      (trailer) => trailer.type === "Trailer"
    )
      ? movie.videos.results.find((trailer) => trailer.type === "Trailer")
      : movie.videos.results[0];
  }

  console.log("movie", movie);
  return (
    <div className="min-h-screen max-w-5xl mx-auto pb-4">
      <Navbar />
      <div className="">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="my-6 h-10 w-10 rounded-full ml-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <ClimbingBoxLoader size={28} />
          </div>
        ) : isError ? (
          <p>Error fetching movie details</p>
        ) : (
          <div className="px-4 mx-auto">
            <div className="flex gap-4 w-full flex-col items-center md:flex-row md:items-start md:shadow-2xl md:gap-6 md:p-4">
              <div className="flex-shrink-0">
                <img
                  src={
                    movie?.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie?.poster_path}`
                      : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                  }
                  alt={movie?.title}
                  className="w-48 h-72 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  {movie?.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie?.genres.slice(0, 3).map((genre) => (
                    <div
                      className="wavy-fade border px-2 py-1 rounded-2xl text-xs"
                      key={genre.id}
                    >
                      {genre.name}
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {movie?.overview}
                </p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{movie?.vote_average}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie?.runtime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatYear(movie?.release_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mb-6 md:mb-8 mt-4 no-scrollbar overflow-hidden"
              ref={containerRef}
            >
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
                Cast
              </h2>
              <motion.div
                ref={contentRef}
                drag="x"
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                dragMomentum={true}
                whileDrag={{ cursor: "grabbing" }}
                className="flex gap-3 md:gap-4 w-fit pb-2 cursor-grab"
              >
                {movie?.credits.cast.map((actor, index) => (
                  <div
                    key={actor.id}
                    className="flex-shrink-0 text-center wavy-fade"
                    style={{ "--genreIndex": index + 1 } as React.CSSProperties}
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted mb-2 overflow-hidden">
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                            : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                        }
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-foreground max-w-[70px] md:max-w-[80px] truncate">
                      {actor.name}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
                Trailer
              </h2>
                <div className="aspect-video flex items-center justify-center bg-muted">
                  {movie?.videos.results.length != 0 ? (
                      <iframe
                        width="400"
                        height="315"
                        src={`https://www.youtube.com/embed/${officialTrailer?.key}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                  ) : (
                    <div>
                      <h3>No trailer available</h3>
                    </div>
                  )}
                </div>

            </div>
            {id && <SimilarMovies movieId={id} />}
          </div>
        )}
      </div>
    </div>
  );
}
