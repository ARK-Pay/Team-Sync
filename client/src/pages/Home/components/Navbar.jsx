import React, { useState, useEffect } from "react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/userSlice";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ setSignInOpen }) => {
  const navigate = useNavigate();
  const location = useLocation(); // To get the current page location
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [exploreOpen, setExploreOpen] = useState(false);
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('userProfileImage') || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
  );

  // Update profile image when localStorage changes or login status changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedImage = localStorage.getItem('userProfileImage');
      console.log('Navbar: Retrieved profile image from localStorage:', storedImage);
      if (storedImage) {
        setProfileImage(storedImage);
      } else {
        setProfileImage("https://flowbite.com/docs/images/people/profile-picture-5.jpg");
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Always check when this component mounts or login status changes
    handleStorageChange();
    
    // If logged in, fetch profile image from server as a backup
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:3001/user/profile', {
          headers: { authorization: token }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.user && data.user.profile_image) {
            console.log('Navbar: Retrieved profile image from server:', data.user.profile_image);
            localStorage.setItem('userProfileImage', data.user.profile_image);
            setProfileImage(data.user.profile_image);
          }
        })
        .catch(err => console.error('Error fetching profile image:', err));
      }
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoggedIn]);

  // Scroll event to fade the navbar
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false); // fade out on scroll down
      } else {
        setIsVisible(true); // fade in on scroll up
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for explore menu open/close
  useEffect(() => {
    const checkExploreMenu = () => {
      // Check if the nav-panel is visible
      const navPanel = document.querySelector('.nav-panel');
      if (navPanel) {
        setExploreOpen(navPanel.style.visibility === 'visible');
      }
    };

    // Create MutationObserver to watch for visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          checkExploreMenu();
        }
      });
    });

    // Start observing the nav-panel
    const navPanel = document.querySelector('.nav-panel');
    if (navPanel) {
      observer.observe(navPanel, { attributes: true });
    }

    // Listen for button clicks
    const exploreBtn = document.querySelector('.button--bestia');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', checkExploreMenu);
    }

    return () => {
      if (navPanel) observer.disconnect();
      if (exploreBtn) exploreBtn.removeEventListener('click', checkExploreMenu);
    };
  }, []);

  // Update profile image when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem('userProfileImage');
      if (updatedImage) {
        setProfileImage(updatedImage);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Initial check
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleMenuItemClick = (event) => {
    // Prevent default behavior of anchor links
    event.preventDefault();
    
    // Get the target section ID from the anchor link
    const targetId = event.target.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
  
    // Close the mobile menu
    setMenuOpen(false);
    
    // Smooth scroll to the target element
    targetElement.scrollIntoView({ behavior: "smooth" });
  
    // Set a timeout to hide the navbar after scrolling
    setTimeout(() => {
      setIsVisible(false); // hide navbar after scrolling
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfileImage');
    dispatch(logout());
  };

  // Only render the Navbar if we're on the homepage
  if (location.pathname !== "/") {
    return null; // Return null if the current path is not the home page
  }

  // Don't show navbar if explore menu is open
  if (exploreOpen) {
    return null;
  }

  return (
    <>
      {/* Main Navbar Container */}
      <div
        className={`w-full max-w-[1320px] h-[80px] px-5 py-0 mx-auto mb-3 mt-2 flex items-center justify-between fixed top-0 left-0 right-0 bg-blue-100/90 shadow-lg rounded-lg backdrop-blur-md z-50 transition-opacity duration-500 ease-in-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        }`}
      >
        {/* Left Section: Logo */}
        <div className="font-bold text-2xl bg-gradient-to-r from-[#1a73e8] to-[#34a853] bg-clip-text text-transparent cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105">
          Team Sync
        </div>

        {/* Center Menu - Hidden on Mobile */}
        <ul className="hidden md:flex items-center gap-10 list-none mx-auto">
          <li className="group relative">
            <a href="#home" onClick={handleMenuItemClick} className="neon-text font-extrabold cursor-pointer transition-colors duration-300 group-hover:text-[#306EE8]">
              Home
            </a>
            <span className="absolute bottom-[-6px] left-1/2 w-0 h-[2px] bg-[#306EE8] group-hover:w-full transition-all duration-300 ease-in-out origin-center group-hover:left-0"></span>
          </li>
          <li className="group relative">
            <a href="#about" onClick={handleMenuItemClick} className="neon-text font-extrabold cursor-pointer transition-colors duration-300 group-hover:text-[#0056b3]">
              About Us
            </a>
            <span className="absolute bottom-[-6px] left-1/2 w-0 h-[2px] bg-[#0056b3] group-hover:w-full transition-all duration-300 ease-in-out origin-center group-hover:left-0"></span>
          </li>
          <li className="group relative">
            <a href="#services" onClick={handleMenuItemClick} className="neon-text font-extrabold cursor-pointer transition-colors duration-300 group-hover:text-[#0056b3]">
              Services
            </a>
            <span className="absolute bottom-[-6px] left-1/2 w-0 h-[2px] bg-[#0056b3] group-hover:w-full transition-all duration-300 ease-in-out origin-center group-hover:left-0"></span>
          </li>
          <li className="group relative">
            <a href="#contact" onClick={handleMenuItemClick} className="neon-text font-extrabold cursor-pointer transition-colors duration-300 group-hover:text-[#0056b3]">
              Contact Us
            </a>
            <span className="absolute bottom-[-6px] left-1/2 w-0 h-[2px] bg-[#0056b3] group-hover:w-full transition-all duration-300 ease-in-out origin-center group-hover:left-0"></span>
          </li>
        </ul>

        {/* Right Section: Avatar + Logout or Sign In */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 py-1 px-4 font-semibold text-lg text-white bg-slate-950 border-2 border-[#0288d1] rounded-full hover:bg-[#0056b3] hover:text-white transition-all duration-300 transform hover:translate-y-[-3px] shadow-lg hover:shadow-2xl whitespace-nowrap"
                title="Dashboard"
                onClick={() => {
                  localStorage.getItem("isAdmin") === "true"
                    ? navigate("/dashboard/admin")
                    : navigate("/dashboard/user");
                }}
              >
                <img
                  src={profileImage}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <span className="truncate">Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-2 px-6 bg-[#001f3d] font-semibold text-lg text-white rounded-full hover:bg-[#6B5BCD] hover:text-white border-2 border-[#0288d1] transition-all duration-300 transform hover:translate-y-[-3px] shadow-lg hover:shadow-2xl"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="py-2 px-6 bg-[white] neon-text font-extrabold cursor-pointer rounded-full hover:bg-white hover:text-[#6B5BCD] border-2 border-[#0056b3] transition-all duration-300 transform hover:translate-y-[-3px] shadow-lg hover:shadow-2xl flex items-center gap-2"
            >
              <AccountCircleOutlinedIcon />
              Sign In
            </button>
          )}

          {/* Hamburger Menu for Mobile */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="block md:hidden cursor-pointer"
          >
            {menuOpen ? (
              <CloseIcon fontSize="large" className="text-white" />
            ) : (
              <MenuIcon fontSize="large" className="text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-[80px] left-0 right-0 bottom-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <ul className="absolute right-[30px] top-[20px] bg-white p-5 rounded-lg shadow-lg w-[300px] z-50 transition-all duration-300">
            <li className="group relative mt-1 flex items-center justify-center h-12">
              <a
                href="#home"
                onClick={handleMenuItemClick}
                className="font-extrabold text-xl text-[#0066cc] hover:text-[#003366]"
              >
                Home
              </a>
            </li>
            <li className="group relative mt-1 flex items-center justify-center h-12">
              <a
                href="#about"
                onClick={handleMenuItemClick}
                className="font-extrabold text-xl text-[#0066cc] hover:text-[#003366]"
              >
                About Us
              </a>
            </li>
            <li className="group relative mt-1 flex items-center justify-center h-12">
              <a
                href="#services"
                onClick={handleMenuItemClick}
                className="font-extrabold text-xl text-[#0066cc] hover:text-[#003366]"
              >
                Services
              </a>
            </li>
            <li className="group relative mt-1 flex items-center justify-center h-12">
              <a
                href="#contact"
                onClick={handleMenuItemClick}
                className="font-extrabold text-xl text-[#0066cc] hover:text-[#003366]"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
