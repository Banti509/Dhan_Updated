

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} All rights reserved</p>
        <p className="mt-0">Made with ❤️ for the web</p>
      </div>
    </footer>
  );
};

export default Footer;