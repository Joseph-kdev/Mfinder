const baseUrl = "https://api.themoviedb.org/3";
const header = {
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
  "Content-Type": "application/json",
};

export const fetchGenres = async () => {
  const cachedGenres = sessionStorage.getItem("movieGenres");
  if (cachedGenres) {
    return JSON.parse(cachedGenres);
  }

  try {
    const response = await fetch(`${baseUrl}/genre/movie/list`, {
      headers: header,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    sessionStorage.setItem("movieGenres", JSON.stringify(data.genres));
    return data.genres;
  } catch (error) {
    console.log("Error fetching genres:", error);
    throw error;
  }
};

export const fetchMoviesByGenre = async ({
  selectedGenres,
  page,
}: {
  selectedGenres: number[];
  page: number;
}) => {
  const fetchGenresQuery =
    selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(",")}` : "";
  try {
    const response = await fetch(
      `${baseUrl}/discover/movie?sort_by=popularity.desc${fetchGenresQuery}&page=${page}`,
      {
        headers: header,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data
  } catch (error) {
    console.log("Error fetching movies:", error);
    throw error;
  }
};
