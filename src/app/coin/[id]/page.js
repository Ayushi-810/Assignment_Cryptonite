"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { fetchCoinDetails, addToRecentlyViewed } from '@/redux/slices/coinsSlice';
import { fetchHistoricalData } from '@/redux/slices/historicalDataSlice';
import CoinBarChart from '@/components/CoinBarChart';
import { setTheme } from '@/redux/slices/themeSlice';
import Image from 'next/image';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const kMB = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'k';
  } else {
    return value;
  }
};

const formatValue = (value) => {
  if (value === undefined || value === null) return 'N/A';
  const numValue = Number(value);
  return numValue.toLocaleString();
};

const CoinPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dm = useSelector((state) => state.theme.isDarkMode);
  const coinData = useSelector((state) => state.coins.coinDetails[id]);
  const historicalData = useSelector((state) => state.historicalData.data.find((data) => data.name === id));
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleDragStart = useCallback((e) => {
    if (coinData) {
      const dragData = {
        id: coinData.id,
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image.thumb,
        current_price: coinData.market_data.current_price.usd,
        price_change_percentage_24h: coinData.market_data.price_change_percentage_24h,
        market_cap: coinData.market_data.market_cap.usd,
      };
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
  }, [coinData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('isDarkMode');
      setIsDarkMode(savedTheme !== null ? JSON.parse(savedTheme) : true)
      if (savedTheme !== null) {
        dispatch(setTheme(JSON.parse(savedTheme)));
      }
    }
  }, [dispatch, dm]);

  useEffect(() => {
    if (id) {
      dispatch(fetchCoinDetails(id)).then((action) => {
        if (action.payload) {
          const coinForRecentlyViewed = {
            id: action.payload.id,
            name: action.payload.name,
            symbol: action.payload.symbol,
            image: action.payload.image.thumb,
            market_cap_rank: action.payload.market_cap_rank,
            genesis_date: action.payload.genesis_date,
          };
          dispatch(addToRecentlyViewed(coinForRecentlyViewed));
        }
      });
      dispatch(fetchHistoricalData({ coins: [id], days: '30' }));
    }
  }, [dispatch, id]);

  const formattedHistoricalData = useMemo(() =>
    historicalData?.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp),
      price: price
    })), [historicalData]);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const displayedPrice = coinData?.market_data.current_price.usd;

  return (
    <div className="flex flex-col gap-5 mx-auto border-gray-400 md:mb-5">
      <div className={`p-2 md:p-3 border-2 theme-transition justify-between ${isDarkMode ? "bg-gray-950 border-gray-600 text-white" : "bg-gray-100 border-gray-400 text-black"} rounded-lg`}>
        <div className='flex-col gap-3 md:flex-row flex justify-between items-center py-3'>
          <div
            draggable={coinData ? true : false}
            onDragStart={handleDragStart}
            className='flex gap-2 items-center'>
            {coinData?.image?.thumb && <Image className='h-8 w-8 md:h-10 md:w-10 rounded-full border-[1px] border-gray-500 object-cover' height={1000} width={1000} src={coinData?.image?.thumb} alt={coinData?.name} />}
            <h1 className="text-lg md:text-xl text-center md:text-left font-semibold uppercase">{id}</h1>
            <span className='relative -left-1 bottom-2 text-xs'>{coinData?.symbol}</span>
          </div>
          {displayedPrice !== undefined && (
            <div className='flex gap-2 items-center'>
              <div className='px-1 py-0.5 border-[2px] border-gray-400 rounded-md text-xs flex gap-1 items-center font-semibold'>Live <span className='text-[8px]'>🟢</span></div>
              <p className='font-semibold md:text-lg'>${(displayedPrice.toLocaleString())}</p>
            </div>
          )}
        </div>
        {coinData && (
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between text-xs border-t-[1px] border-gray-600 pt-3'>
              <p className='py-1'><strong>Market Cap:</strong> ${formatValue(coinData.market_data.market_cap.usd)}</p>
              <p className='py-1 flex items-center gap-2'><strong>Today</strong><span className={`flex items-center pr-2 font-semibold rounded-lg theme-transition ${isDarkMode?"bg-gray-800":"bg-gray-200"} ${coinData.market_data.price_change_percentage_24h>=0 ? 'text-green-500' : 'text-red-500'}`}>{coinData.market_data.price_change_percentage_24h>=0?<ArrowDropUp/>:<ArrowDropDown/>}{(coinData.market_data.price_change_percentage_24h).toFixed(2)}%</span> </p>
            </div>
            <div className='flex justify-between text-xs border-b-[1px] border-gray-600 pb-3'>
              <p className='py-1'><strong>Max Supply:</strong> ${formatValue(coinData.market_data.max_supply)}</p>
              <p className='py-1'><strong>Total Volume:</strong> ${formatValue(coinData.market_data.total_volume.usd)}</p>
            </div>
          </div>
        )}
      </div>
      <div className={`p-2 md:p-3 border-2 theme-transition ${isDarkMode ? "bg-gray-950 border-gray-600 text-white" : "bg-gray-100 border-gray-400 text-black"} rounded-lg`}>
        <h2 draggable onDragStart={handleDragStart} className="text-lg md:text-xl mb-4 text-center md:text-left font-semibold">Price Change Percentages</h2>
        {coinData ? <CoinBarChart isDarkMode={isDarkMode} coinData={coinData} /> : <div className={`p-2 text-center text-sm font-semibold w-full`}><p className='mb-2'>LOADING GRAPH...</p><CircularProgress/></div>}
      </div>
      {coinData?.description?.en && (
      <div className={`p-2 md:p-3 border-2 theme-transition ${isDarkMode ? "bg-gray-950 border-gray-600 text-white" : "bg-gray-100 border-gray-400 text-black"} rounded-lg`}>
        <h2 draggable onDragStart={handleDragStart} className="text-lg md:text-xl md:text-left text-center font-semibold mb-4">About {coinData.name}</h2>
        <div className='text-xs md:text-sm md:text-left text-center'>
          <p dangerouslySetInnerHTML={{ __html: showFullDescription ? coinData.description.en : truncateText(coinData.description.en, 300) }} />
          {coinData.description.en.length > 300 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-1 text-gray-500 hover:text-gray-400 transition-colors duration-200"
            >
              {showFullDescription ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default CoinPage;
