import React, { useState, useEffect } from "react";
import jsonp from "jsonp";

const popularTags = ["nature", "animals", "landscape", "city", "travel", "art", "technology"]; 

const FlickrFeed = () => {
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10; // Number of photos per page

  const fetchPhotos = (tags = "", page = 1) => {
    setLoading(true);
    const url = `https://www.flickr.com/services/feeds/photos_public.gne?format=json&tags=${tags}&jsoncallback=JSONP_CALLBACK`;

    jsonp(url, { name: "JSONP_CALLBACK" }, (err, data) => {
      if (err) {
        console.error("Error fetching data", err);
        setLoading(false);
        return;
      }
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPhotos = data.items.slice(startIndex, endIndex);
      setPhotos(paginatedPhotos);
      setTotalPages(Math.ceil(data.items.length / itemsPerPage)); // Calculate total pages
      setLoading(false);
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPhotos(searchTerm, currentPage);
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (searchTerm) {
      const filteredSuggestions = popularTags.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSuggestionClick = (tag) => {
    setSearchTerm(tag);
    setSuggestions([]); // Clear suggestions after selection
    setCurrentPage(1); // Reset to the first page when changing the tag
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flickr-container">
      <h1>Flickr Public Feed Viewer</h1>
      <input
        type="text"
        placeholder="Search by tag..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((tag, index) => (
            <li key={index} onClick={() => handleSuggestionClick(tag)}>
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="gallery">
        {loading ? (
          <p>Loading...</p>
        ) : photos.length === 0 ? (
          <p>No results found</p>
        ) : (
          photos.map((photo) => (
            <div key={photo.link} className="photo-card">
              <a href={photo.media.m.replace("_m", "_b")} target="_blank" rel="noreferrer">
                <img src={photo.media.m} alt={photo.title} />
              </a>
              <div className="photo-info">
                <h3>{photo.title || "Untitled"}</h3>
                <p>By: {photo.author.match(/"(.*?)"/)[1]}</p>
                <p>Tags: {photo.tags || "None"}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlickrFeed;
