import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-8">Welcome to Instant Arcade!</h1>
      <Link 
        to="/game" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Play Game
      </Link>
    </div>
  );
}

export default Home;
