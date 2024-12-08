import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Game() {
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('Game component mounted');
    
    if (!containerRef.current) {
      console.error('Container ref not found');
      return;
    }

    // Initialize Three.js
    const scene = new THREE.Scene();
    console.log('Scene created:', scene);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    console.log('Camera created and positioned');

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x282c34); // Dark background color
    console.log('Renderer created');

    // Clear any existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    containerRef.current.appendChild(renderer.domElement);
    console.log('Canvas appended to container');

    // Add a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    console.log('Cube added to scene');

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();
    console.log('Animation started');

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('Cleaning up Three.js');
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div id="game-container" className="w-full h-full absolute top-0 left-0 z-10" ref={containerRef} />
      <div className="absolute top-0 left-0 text-black z-20">Game Component Loaded</div>
    </div>
  );
}

export default Game;
