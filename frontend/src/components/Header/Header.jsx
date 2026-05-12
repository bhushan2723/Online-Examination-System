import React from 'react';
import './Header.css';

const Header = ({
  onSearch,
  onToggleTheme,
  onNotificationsClick,
  userImageUrl = 'https://storage.googleapis.com/a1aa/image/a317e571-a4ca-4a9e-3e62-f501a97bb3d8.jpg',
  userImageAlt = 'User profile picture',
  searchPlaceholder = 'Type a command or search...',
}) => {
  const handleSearch = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="d-flex align-items-center justify-content-between p-2 border-bottom">
      <div className="d-flex align-items-center pe-3 header-border mx-3">
        <h6 className="header-logo-text">
          <i className="fas fa-graduation-cap"></i>
          <span>SKILLS</span>
          <span className="green-text">CHECK</span>
        </h6>
      </div>
      
      <input
        type="search"
        className="form-control flex-grow-1 mx-4"
        placeholder={searchPlaceholder}
        aria-label="Search"
        style={{ maxWidth: '600px' }}
        onChange={handleSearch}
      />
      <div className='header-right-side' style={{ marginRight: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-link text-secondary ps-3 pe-0 "
          aria-label="Toggle theme"
          onClick={onToggleTheme}
        >
          <i className="fas fa-sun fa-lg"></i>
        </button>
        
        <button
          type="button"
          className="btn btn-link text-secondary px-3"
          aria-label="Notifications"
          onClick={onNotificationsClick}
        >
          <i className="fas fa-bell fa-lg"></i>
        </button>
        
        <img
          src={userImageUrl}
          alt={userImageAlt}
          className="rounded-circle"
          width="32"
          height="32"
        />
      </div>
      
      
    </header>
  );
};

export default Header;