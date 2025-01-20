import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CatCard from './CatCard';
import './App.css';

const App = () => {
  const [cats, setCats] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const fetchCats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.thecatapi.com/v1/images/search?limit=10&page=${page}`
      );
      setCats((prevCats) => [...prevCats, ...response.data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        threshold: 1,
      }
    );
    if (view === 'all' && cats.length > 0) {
      observer.current.observe(document.querySelector('.loader-container'));
    }
  }, [cats, view, loading]);

  useEffect(() => {
    if (page > 1 && view === 'all') {
      fetchCats();
    }
  }, [page, view]);

  const toggleFavorite = (cat) => {
    const isFavorite = favorites.some((fav) => fav.id === cat.id);
    const updatedFavorites = isFavorite
      ? favorites.filter((fav) => fav.id !== cat.id)
      : [...favorites, cat];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const displayedCats = view === 'all' ? cats : favorites;

  return (
    <div className="app">
      <nav>
        <div className="buttons">
          <button
            className={`all ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            Все котики
          </button>
          <button
            className={`favorites ${view === 'favorites' ? 'active' : ''}`}
            onClick={() => setView('favorites')}
          >
            Любимые котики
          </button>
        </div>
      </nav>
      <div className="cat-container">
        {displayedCats.map((cat) => (
          <CatCard
            key={cat.id}
            cat={cat}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
          />
        ))}
        {view === 'all' && (
          <div className="loader-container">
            {loading && <div className="loading-text">...загружаем еще котиков...</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;