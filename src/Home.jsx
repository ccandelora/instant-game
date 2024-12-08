import React from 'react';

    function Home() {
      return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome to Instant Arcade!</h1>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => window.location.href = '/game'}>
            Play Game
          </button>
        </div>
      );
    }

    export default Home;
