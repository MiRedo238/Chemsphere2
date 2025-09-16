// src/components/Autocomplete.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Autocomplete = ({
  value,
  onChange,
  suggestions,
  placeholder = "",
  className = "",
  onSelect,
  field = "name",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(item =>
        item[field]?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
    } else {
      setFilteredSuggestions(suggestions.slice(0, 5));
    }
  }, [value, suggestions, field]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (item) => {
    onChange(item[field]);
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      e.preventDefault();
      handleSelect(filteredSuggestions[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="autocomplete-container">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`form-input pr-8 ${className}`}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          {filteredSuggestions.map((item, index) => (
            <div
              key={index}
              className="autocomplete-item"
              onClick={() => handleSelect(item)}
            >
              {item[field]}
              {item.batchNumber && (
                <span className="text-xs text-gray-500 ml-2">
                  {item.batchNumber}
                </span>
              )}
              {item.brand && (
                <span className="text-xs text-gray-500 ml-2">
                  {item.brand}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;