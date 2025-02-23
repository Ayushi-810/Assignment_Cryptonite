// explore/page.js
'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { fetchCoins } from '@/redux/slices/coinsSlice';
import { addToWatchlist } from '@/redux/slices/watchListSlice';
import { ArrowLeft, ArrowRight, Replay } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { coins, status, error } = useSelector((state) => state.coins);
  const [page, setPage] = useState(1);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const router=useRouter();

  useEffect(() => {
    dispatch(fetchCoins(page));
  }, [dispatch, page]);

  const handleDragStart = (e, coin) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(coin));
  };
  
  if (status === 'loading') {
    return <div className={`text-center text-sm font-semibold w-full border-[2px] rounded-lg theme-transition ${isDarkMode?"bg-gray-950 border-gray-600 text-white":"bg-gray-100 border-gray-400 text-black"} p-2`}><p className='mb-2'>LOADING EXPLORE SECTION...</p><CircularProgress/></div>;
  }

  if (status === 'failed') {
    return <div className={`text-center text-sm font-semibold w-full border-[2px] rounded-lg theme-transition ${isDarkMode?"bg-gray-950 border-gray-600 text-white":"bg-gray-100 border-gray-400 text-black"} p-2`}><p className='mb-2'>Error loading section, Please try again</p><div className='cursor-pointer' onClick={()=>{window.location.reload()}}><Replay/></div></div>;
  }

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2) + '%';
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleClick=(id)=>{
    router.push("/coin/"+id);
  }

  const handleAddToWatchlist = (coin) => {
    dispatch(addToWatchlist(coin));
    const storedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const updatedWatchlist = [...storedWatchlist, coin];
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  return (
    <div className={`p-2 md:p-3 text-xs border-[2px] rounded-lg theme-transition ${isDarkMode?"bg-gray-950 border-gray-600":"bg-gray-100 border-gray-400"}`}>
      <h1 className="text-xl font-bold md:text-left text-center mb-4">Explore</h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 uppercase leading-normal border-b-[1px] border-gray-800">
              <th className="py-2 px-3 text-left">Token</th>
              <th className="py-2 px-3 text-right">Market Cap</th>
              <th className="py-2 px-3 text-right">Balance</th>
              <th className="py-2 px-3 text-right">Price</th>
              <th className="py-2 px-3 text-right">Today</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-500 font-light">
            {coins.map((coin) => (
              <tr key={coin.id} onClick={()=>handleClick(coin.id)} draggable onDragStart={(e) => handleDragStart(e, coin)} className={`theme-transition ${isDarkMode?"hover:bg-gray-900":"hover:bg-gray-200"} cursor-pointer`}>
                <td className="py-2 px-3 text-left whitespace-nowrap">
                  <Link href={`/coin/${coin.id}`} className="flex items-center group">
                    <Image height={1000} width={1000} className="w-6 h-6 rounded-full mr-2" src={coin.image} alt={coin.name} />
                    <span className="font-medium text-blue-500 group-hover:text-blue-400">
                      {coin.symbol.toUpperCase()}
                    </span>
                  </Link>
                </td>
                <td className="py-2 px-3 text-right">{formatPrice(coin.market_cap)}</td>
                <td className="py-2 px-3 text-right">${coin.circulating_supply?.toLocaleString() || 'N/A'}</td>
                <td className="py-2 px-3 text-right">{formatPrice(coin.current_price)}</td>
                <td className={`py-2 px-3 text-right ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(coin.price_change_percentage_24h)}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWatchlist(coin);
                    }}
                    className={`py-1 px-2 rounded ${isDarkMode ? "bg-green-600 text-white" : "bg-green-200 text-green-800"}`}
                  >
                    Add to Watchlist
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-2 flex justify-between border-t-[1px] border-gray-800">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="font-bold py-1 px-2 flex items-center rounded text-xs disabled:text-gray-400"
        >
          <ArrowLeft/>
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="font-bold flex items-center py-1 px-2 rounded text-xs"
        >
          Next
          <ArrowRight/>
        </button>
      </div>
    </div>
  );
};

export default ExplorePage;
