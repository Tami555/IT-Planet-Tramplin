import React, { useState } from 'react';
import { Search, UserPlus, Loader } from 'lucide-react';
import Button from '../UI/Button/Button';
import './UserSearch.css';

const UserSearch = ({ onSearch, onSendRequest, isLoading, searchResults, isSending }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="user-search">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск по имени, фамилии или университету..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <Button 
          variant="primary" 
          size="medium"
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          icon={<Search size={18} />}
        >
          Найти
        </Button>
      </div>

      {isLoading && (
        <div className="search-loading">
          <Loader size={24} className="spinner" />
          <p>Поиск...</p>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          <h4>Результаты поиска</h4>
          {searchResults.map(user => (
            <div key={user.id} className="search-result-item">
              <img 
                src={user.avatarUrl || 'https://via.placeholder.com/40x40?text=User'} 
                alt={user.displayName}
                className="result-avatar"
              />
              <div className="result-info">
                <div className="result-name">{user.displayName}</div>
                {user.university && (
                  <div className="result-university">{user.university}</div>
                )}
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={() => onSendRequest(user.id)}
                disabled={isSending}
                icon={<UserPlus size={16} />}
              >
                Добавить в друзья
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchResults && searchResults.length === 0 && query && (
        <div className="search-empty">
          <p>Ничего не найдено</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;