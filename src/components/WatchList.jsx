'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { setWatchlist, removeFromWatchlist, clearWatchlist } from '@/redux/slices/watchListSlice';
import { setTheme } from '@/redux/slices/themeSlice';

const WatchList = () => {
  const dispatch = useDispatch();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dm = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('isDarkMode');
      setIsDarkMode(savedTheme !== null ? JSON.parse(savedTheme) : true);
      if (savedTheme !== null) {
        dispatch(setTheme(JSON.parse(savedTheme)));
      }
    }
  }, [dispatch, dm]);

  const watchlist = useSelector((state) => state.watchlist) || [];
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const storedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    dispatch(setWatchlist(storedWatchlist));
  }, [dispatch]);

  const handleRemoveFromWatchlist = (coin) => {
    dispatch(removeFromWatchlist(coin.id));
    const storedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const updatedWatchlist = storedWatchlist.filter(c => c.id !== coin.id);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  const handleClearWatchlist = () => {
    dispatch(clearWatchlist());
    localStorage.setItem('watchlist', JSON.stringify([]));
  };

  if (watchlist.length === 0) {
    return (
      <div
        className={`mb-5 theme-transition p-3 border-[2px] rounded-lg ${isDarkMode ? "text-white border-gray-600 bg-gray-950" : "text-black bg-gray-100 border-gray-400"} min-h-[200px] flex items-center justify-center`}
      >
        Add and remove coins to watchlist on a click
      </div>
    );
  }

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2) + '%';
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const displayedCoins = showAll ? watchlist : watchlist.slice(0, 5);

  return (
    <div
      className={`theme-transition p-3 text-xs border-[2px] mb-5 rounded-lg ${isDarkMode ? "text-white border-gray-600 bg-gray-950" : "text-black bg-gray-100 border-gray-400"}`}
    >
      <h1 className="text-lg md:text-xl font-bold mb-4 text-center md:text-left">Watchlist</h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 uppercase leading-normal border-b-[1px] border-gray-800">
              <th className="py-2 md:px-3 px-6 text-left">Token</th>
              <th className="py-2 px-3 text-right">Last Price</th>
              <th className="py-2 px-3 text-right">24h Change</th>
              <th className="py-2 px-3 text-right">Market Cap</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-500 font-light">
            {displayedCoins.map((coin) => (
              <tr key={coin?.id} className={`theme-transition ${isDarkMode ? "hover:bg-gray-900" : "hover:bg-gray-200"} cursor-pointer`}>
                <td className="py-2 px-3 text-left whitespace-nowrap">
                  <Link href={`/coin/${coin?.id}`} className="flex items-center group">
                    <img className="w-6 h-6 rounded-full mr-2" src={coin?.large || coin.image} alt={coin?.name} />
                    <span className="font-medium text-blue-400 group-hover:text-blue-300">
                      {coin.symbol.toUpperCase()}
                    </span>
                  </Link>
                </td>
                <td className="py-2 px-3 text-right">
                  {coin.current_price ? formatPrice(coin.current_price) : "$" + parseFloat(coin?.data?.price).toFixed(8)}
                </td>
                <td className={`py-2 px-3 text-right ${(coin?.data ? coin?.data?.price_change_percentage_24h.usd : coin?.price_change_percentage_24h.usd) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.data ? coin?.data.price_change_percentage_24h.usd.toFixed(2) + "%" : formatPercentage(coin.price_change_percentage_24h)}
                </td>
                <td className="py-2 px-3 text-right">
                  {coin?.data ? coin?.data.market_cap : ("$" + coin?.market_cap)}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleRemoveFromWatchlist(coin)}
                    className={`py-1 px-2 rounded ${isDarkMode ? "bg-red-600 text-white" : "bg-red-200 text-red-800"}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {watchlist.length > 5 && (
        <div
          onClick={() => setShowAll(!showAll)}
          className={`w-full text-center mt-2 font-bold py-1.5 px-2 rounded text-xs cursor-pointer ${isDarkMode ? "text-white bg-gray-900" : "text-black bg-gray-200"}`}
        >
          {showAll ? 'Show Less' : 'View More'}
        </div>
      )}
      <div className="w-full text-center mt-2">
        <button
          onClick={handleClearWatchlist}
          className={`py-1.5 px-4 rounded font-bold ${isDarkMode ? "bg-red-600 text-white" : "bg-red-200 text-red-800"}`}
        >
          Clear Watchlist
        </button>
      </div>
    </div>
  );
};

export default WatchList;
