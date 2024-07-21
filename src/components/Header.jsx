// components/Header.js
"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  WbSunny,
  Brightness2,
  History,
  ExploreOutlined,
  Menu,
} from "@mui/icons-material";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setTheme, toggleTheme } from "@/redux/slices/themeSlice";
import {
  addRecentSearch,
  clearRecentSearches,
} from "@/redux/slices/recentSearchesSlice";

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dm = useSelector((state) => state.theme.isDarkMode);
  const recentSearches = useSelector((state) => state.recentSearches.searches);
  const searchRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("isDarkMode");
      setIsDarkMode(savedTheme !== null ? JSON.parse(savedTheme) : true);
      if (savedTheme !== null) {
        dispatch(setTheme(JSON.parse(savedTheme)));
      }
    }
  }, [dispatch, dm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchCoins();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCoins = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/search?query=${searchTerm}`
      );
      setSearchResults(response.data.coins.slice(0, 5));
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching coins:", error);
    }
  };

  const handleCoinSelect = (coin) => {
    router.push(`/coin/${coin.id}`);
    setSearchTerm("");
    setShowDropdown(false);
    dispatch(addRecentSearch(coin));
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav
      className={`theme-transition p-4 py-3 md:py-4 md:px-6 ${
        isDarkMode ? "bg-gray-800 text-black" : "bg-gray-500 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image
            className="h-10 w-10 md:h-12 md:w-12"
            height={1200}
            width={1200}
            src={"/Crypto_logo.png"}
            alt="Logo"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <div
            ref={searchRef}
            className={`relative flex items-center w-[30.5rem] gap-1 pl-1.5 border-[1px] theme-transition ${
              isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "bg-white border-gray-300"
            } rounded-md`}
          >
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              <Search />
            </span>
            <input
              className={`outline-none rounded-r-md p-1.5 w-full text-sm placeholder:text-sm bg-transparent ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {showDropdown && (
              <div
                className={`theme-transition absolute text-xs top-full left-0 w-full mt-1 ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                } border rounded-md shadow-lg z-10`}
              >
                {searchTerm === "" ? (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="flex justify-between items-center p-2 border-b border-b-gray-800">
                        <span className="font-semibold">Recent Searches</span>
                        <button
                          onClick={() => dispatch(clearRecentSearches())}
                          className="text-sm text-blue-500"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                    {recentSearches.map((coin) => (
                      <div
                        key={coin.id}
                        className={`theme-transition p-2 cursor-pointer font-semibold flex items-center ${
                          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleCoinSelect(coin)}
                      >
                        <History className="w-4 h-4 mr-2" />
                        <span>
                          {coin.name} ({coin.symbol})
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  searchResults.map((coin) => (
                    <div
                      key={coin.id}
                      className={`theme-transition p-2 cursor-pointer font-semibold flex items-center ${
                        isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        className="w-6 h-6 mr-2"
                      />
                      <span>
                        {coin.name} ({coin.symbol})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            href="/explore"
            className={`flex items-center space-x-1 px-2 py-1 rounded-md  theme-transition transition-colors ${
              isDarkMode
                ? "bg-yellow-700 hover:bg-yellow-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-black"
            } `}
          >
            <ExploreOutlined />
            <span className="text-sm font-semibold">Explore</span>
          </Link>

          <div
            onClick={handleThemeToggle}
            className="cursor-pointer flex justify-between items-center relative p-1 gap-3 border-[1.5px] border-solid border-yellow rounded-3xl"
          >
            <div className="text-[18px]">🌚</div>
            <div className="text-[18px]">🌝</div>
            <div
              className={`w-[24px] h-[24px]  rounded-full absolute transition-all duration-300 ${
                isDarkMode ? "right-1 bg-yellow-300" : "left-1 bg-yellow-500"
              }`}
            ></div>
          </div>
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <div
            onClick={handleThemeToggle}
            className="cursor-pointer flex justify-between items-center relative p-1 gap-2 border-[1.5px] border-solid border-yellow rounded-2xl"
          >
            <div className="text-[15px]">🌚</div>
            <div className="text-[15px]">🌝</div>
            <div
              className={`w-[20px] h-[20px] bg-white rounded-full absolute transition-all duration-300 ${
                isDarkMode ? "right-1 bg-yellow-300" : "left-1 bg-yellow-500"
              }`}
            ></div>
          </div>
          <button onClick={toggleMobileMenu} className="p-2">
            <Menu />
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div
          className={`md:hidden mt-3 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-md p-3`}
        >
          <div
            ref={searchRef}
            className={`relative flex items-center w-full gap-1 pl-1.5 border-[1px] theme-transition ${
              isDarkMode
                ? "border-gray-600 bg-gray-700"
                : "bg-white border-gray-300"
            } rounded-md mb-3`}
          >
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              <Search />
            </span>
            <input
              className={`outline-none rounded-r-md p-1.5 w-full text-sm placeholder:text-sm bg-transparent ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {showDropdown && (
              <div
                className={`theme-transition absolute text-xs top-full left-0 w-full mt-1 ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                } border rounded-md shadow-lg z-10`}
              >
                {searchTerm === "" ? (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="flex justify-between items-center p-2 border-b border-b-gray-800">
                        <span className="font-semibold">Recent Searches</span>
                        <button
                          onClick={() => dispatch(clearRecentSearches())}
                          className="text-sm text-blue-500"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                    {recentSearches.map((coin) => (
                      <div
                        key={coin.id}
                        className={`theme-transition p-2 cursor-pointer font-semibold flex items-center ${
                          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleCoinSelect(coin)}
                      >
                        <History className="w-4 h-4 mr-2" />
                        <span>
                          {coin.name} ({coin.symbol})
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  searchResults.map((coin) => (
                    <div
                      key={coin.id}
                      className={`theme-transition p-2 cursor-pointer font-semibold flex items-center ${
                        isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        className="w-6 h-6 mr-2"
                      />
                      <span>
                        {coin.name} ({coin.symbol})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            href="/explore"
            className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
            } text-white w-full justify-center`}
          >
            <ExploreOutlined />
            <span>Explore</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
