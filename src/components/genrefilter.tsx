import { fetchGenres } from "@/services/movies";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import type { Genre } from "@/types";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export default function Genrefilter() {
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    data: genres,
    isLoading,
    isError,
  } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: fetchGenres,
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
  }, []);

  console.log("genres", genres);
  return (
    <div
      className="flex gap-2 max-w-4xl mx-auto px-4 2xl:p-0 mt-4 items-center"
    >
      <div className="">
        <p className="min-w-[120px]">Filter by genres:</p>
      </div>
      <div className="flex-1 gap-2 overflow-hidden py-2 no-scrollbar cursor-grab active:cursor-grabbing" ref={containerRef}>
        <motion.div
        ref={contentRef}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={true}
          whileDrag={{ cursor: "grabbing" }}
          className="flex gap-2 w-fit"
        >
          {isLoading ? (
            <div className="">
              <Skeleton className="h-5 min-w-[60px] bg-amber-500" />
              <Skeleton className="h-5 min-w-[80px] bg-amber-500" />
              <Skeleton className="h-5 min-w-[100px] bg-amber-500" />
              <Skeleton className="h-5 min-w-[50px] bg-amber-500" />
              <Skeleton className="h-5 min-w-[50px] bg-amber-500" />
              <Skeleton className="h-5 min-w-[150px] bg-amber-500" />
            </div>
          ) : isError ? (
            <p>"Error fetching genres"</p>
          ) : (
            genres?.map((genre) => (
              <Button variant="outline" key={genre.id}>
                {genre.name}
              </Button>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
