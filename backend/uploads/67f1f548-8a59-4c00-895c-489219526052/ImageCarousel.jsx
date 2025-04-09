import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Import carousel images
import image1 from '../assets/Image_carousel 1.webp';
import image2 from '../assets/Image_carousel 2.jpeg';
import image3 from '../assets/Image_carousel 3.jpeg';
import image4 from '../assets/Image_carousel 4.jpeg';
import image5 from '../assets/Image_carousel 5.jpeg';
import image6 from '../assets/Image_carousel 6.jpeg';
import image7 from '../assets/Image_carousel 7.jpeg';
import image8 from '../assets/Image_carousel 8.jpeg';
import image9 from '../assets/Image_carousel 9.jpeg';
import image10 from '../assets/Image_carousel 10.webp';
import image11 from '../assets/Image_carousel 11.webp';

const ImageCarousel = () => {
  // Array of carousel images
  const images = [
    { src: image1, alt: 'Team Collaboration 1' },
    { src: image2, alt: 'Team Collaboration 2' },
    { src: image3, alt: 'Team Collaboration 3' },
    { src: image4, alt: 'Team Collaboration 4' },
    { src: image5, alt: 'Team Collaboration 5' },
    { src: image6, alt: 'Team Collaboration 6' },
    { src: image7, alt: 'Team Collaboration 7' },
    { src: image8, alt: 'Team Collaboration 8' },
    { src: image9, alt: 'Team Collaboration 9' },
    { src: image10, alt: 'Team Collaboration 10' },
    { src: image11, alt: 'Team Collaboration 11' },
  ];

  // State for current slide index
  const [currentIndex, setCurrentIndex] = useState(0);
  // State to track if autoplay is paused
  const [isPaused, setIsPaused] = useState(false);
  // Ref for the autoplay interval
  const autoplayRef = useRef(null);

  // Function to go to next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  // Function to go to previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  // Function to go to a specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Setup autoplay functionality
  useEffect(() => {
    // Clear any existing interval
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }

    // Only set up autoplay if not paused
    if (!isPaused) {
      autoplayRef.current = setInterval(() => {
        nextSlide();
      }, 3000); // Change slide every 3 seconds
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg shadow-lg"
      style={{ height: '500px' }} // Fixed height for the carousel
      onMouseEnter={() => setIsPaused(true)} // Pause autoplay on hover
      onMouseLeave={() => setIsPaused(false)} // Resume autoplay when not hovering
    >
      {/* Carousel container with transition effect */}
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {/* Map through images to create slides */}
        {images.map((image, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full h-full"
            style={{ flexBasis: '100%' }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-300"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-300"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
