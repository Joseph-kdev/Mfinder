export const fetchGenres = async() => {
    const cachedGenres = sessionStorage.getItem('movieGenres')
    if (cachedGenres) {
        return JSON.parse(cachedGenres)
    }

    try {
        const response = await fetch('https://api.themoviedb.org/3/genre/movie/list', {
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_TMDB_KEY}`,
                'Content-Type': 'application/json'
            }
        })
    
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    
        const data = await response.json()
        sessionStorage.setItem('movieGenres', JSON.stringify(data.genres))
        return data.genres
    } catch (error) {
        console.log("Error fetching genres:", error)
        throw error
    }
}