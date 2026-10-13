'use client';

import { Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Link } from '~/components/link';

import { BrandItem } from '../page-data';

interface BrandsDirectoryClientProps {
  brands: BrandItem[];
  title?: string;
  subtitle?: string;
}

const ALPHABET = [
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

function getBrandCharGroup(name: string): string {
  const firstChar = name.trim().charAt(0).toUpperCase();

  if (/^[A-Z]$/.test(firstChar)) {
    return firstChar;
  }

  return '#';
}

export function BrandsDirectoryClient({
  brands,
  title = 'BRAND LIST',
  subtitle = 'Discover designers and collections available in our catalog',
}: BrandsDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    let result = brands;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = result.filter((b) => b.name.toLowerCase().includes(term));
    }

    if (selectedLetter && selectedLetter !== 'ALL') {
      result = result.filter((b) => getBrandCharGroup(b.name) === selectedLetter);
    }

    return result;
  }, [brands, searchTerm, selectedLetter]);

  // Grouped by character
  const groupedBrands = useMemo(() => {
    const groups = new Map<string, BrandItem[]>();

    for (const brand of filteredBrands) {
      const char = getBrandCharGroup(brand.name);

      if (!groups.has(char)) {
        groups.set(char, []);
      }

      groups.get(char)!.push(brand);
    }

    // Sort letters: # first, then A-Z
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;

      return a.localeCompare(b);
    });

    return sortedKeys.map((letter) => ({
      letter,
      items: groups.get(letter) ?? [],
    }));
  }, [filteredBrands]);

  // Set of letters that actually have brands in the full catalog
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();

    for (const brand of brands) {
      letters.add(getBrandCharGroup(brand.name));
    }

    return letters;
  }, [brands]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section matching ELLE SHOP elegance */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-light tracking-[0.25em] text-gray-900 uppercase sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm tracking-widest text-gray-500 uppercase">{subtitle}</p>
        <div className="mx-auto mt-4 h-0.5 w-12 bg-black" />
      </div>

      {/* Search Bar & Total count */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-6 md:flex-row">
        <div className="relative w-full max-w-md">
          <input
            className="w-full rounded-full border border-gray-300 py-2 pr-4 pl-10 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            type="text"
            value={searchTerm}
          />
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button
              className="absolute top-2.5 right-3 text-xs text-gray-400 hover:text-black"
              onClick={() => setSearchTerm('')}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs tracking-wider text-gray-600 uppercase">
          Total: <span className="font-semibold text-black">{filteredBrands.length}</span> Brands
        </div>
      </div>

      {/* Alphabet Index Jump Bar */}
      <nav
        aria-label="Alphabetical brand filter"
        className="sticky top-20 z-10 mb-12 rounded-lg border border-gray-100 bg-white/95 p-3 shadow-xs backdrop-blur-md"
      >
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <button
            className={`rounded-sm px-2.5 py-1 text-xs font-medium tracking-wider transition-colors ${
              selectedLetter === null
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            }`}
            onClick={() => setSelectedLetter(null)}
            type="button"
          >
            ALL
          </button>
          {ALPHABET.map((char) => {
            const hasBrands = availableLetters.has(char);
            const isSelected = selectedLetter === char;

            return (
              <button
                className={`min-w-6 rounded-sm px-1.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-black text-white'
                    : hasBrands
                      ? 'text-gray-800 hover:bg-gray-100 hover:text-black'
                      : 'cursor-not-allowed text-gray-300'
                }`}
                disabled={!hasBrands}
                key={char}
                onClick={() => {
                  if (hasBrands) {
                    setSelectedLetter(isSelected ? null : char);
                  }
                }}
                type="button"
              >
                {char}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Brand Groups */}
      {groupedBrands.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base text-gray-500">No brands found matching "{searchTerm}"</p>
          <button
            className="mt-4 text-xs font-semibold tracking-wider text-black underline uppercase"
            onClick={() => {
              setSearchTerm('');
              setSelectedLetter(null);
            }}
            type="button"
          >
            View all brands
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedBrands.map(({ letter, items }) => (
            <section
              className="scroll-mt-36 border-t border-gray-200 pt-8"
              id={`group-${letter}`}
              key={letter}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {letter}
                </span>
                <span className="text-xs tracking-widest text-gray-400 uppercase">
                  ({items.length} {items.length === 1 ? 'brand' : 'brands'})
                </span>
              </div>

              {/* Grid matching ELLE SHOP multi-column brand list */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((brand) => (
                  <div
                    className="group relative flex items-center justify-between rounded-md border border-transparent p-2.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
                    key={brand.entityId}
                  >
                    <Link
                      className="flex min-w-0 flex-1 flex-col focus:outline-none"
                      href={brand.path || `/brands/${brand.entityId}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium tracking-wide text-gray-900 group-hover:text-black">
                          {brand.name}
                        </span>
                        {brand.productCount > 0 ? (
                          <span className="text-xs text-gray-400">({brand.productCount})</span>
                        ) : null}
                      </div>
                    </Link>

                    {/* Product count badge or link arrow */}
                    {brand.productCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Sparkles className="h-2.5 w-2.5" />
                        In Stock
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
