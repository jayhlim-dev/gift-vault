'use client';

import { useState } from 'react';

export function SearchBar({
    onSearch,
    onChange,
    placeholder = 'Search...',
    defaultValue = '',
    value,
    searchOnType = false,
    disabled = false,
    name = 'search',
    className = '',
    inputClassName = '',
    showClear = false
}) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = typeof value === 'string';
    const currentValue = isControlled ? value : internalValue;

    function updateValue(nextValue, event) {
        if (!isControlled) {
            setInternalValue(nextValue);
        }

        if (onChange) {
            onChange(nextValue, event);
        }

        if (searchOnType && onSearch) {
            onSearch(nextValue);
        }
    }

    function handleChange(event) {
        updateValue(event.target.value, event);
    }

    function handleClear() {
        updateValue('');
        if (onSearch) {
            onSearch('');
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (onSearch) {
            onSearch(currentValue);
        }
    }

    const canClear = showClear && Boolean(currentValue);

    return (
        <form onSubmit={handleSubmit} role="search" className={className}>
            <div className="relative">
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400"
                >
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    type="search"
                    name={name}
                    value={currentValue}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full rounded-xl bg-white py-2.5 pl-10 text-sm text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 [&::-webkit-search-cancel-button]:hidden ${
                        canClear ? 'pr-10' : 'pr-4'
                    } ${inputClassName}`}
                />
                {canClear ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
                    >
                        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                            <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                ) : null}
            </div>
        </form>
    );
}
