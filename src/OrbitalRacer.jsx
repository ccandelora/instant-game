import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

function OrbitalRacer() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Initializing OrbitalRacer');
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000022); // Dark space background
    
    const container = mountRef.current;
    if (!container) {
      console.error('Container ref not found');
      return;
    }
    
    container.appendChild(renderer.domElement);
    console.log('Renderer added to container');

    // Create central planet
    const planetGeometry = new THREE.SphereGeometry(2, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);

    // Create player ship
    const shipGeometry = new THREE.ConeGeometry(0.5, 1, 3);
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ship = new THREE.Mesh(shipGeometry, shipMaterial);
    scene.add(ship);

    // Set initial ship position
    const orbitRadius = 5;
    ship.position.set(orbitRadius, 0, 0);

    // Position camera
    camera.position.z = 15;

    // Animation
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate ship around planet
      angle += 0.02;
      ship.position.x = Math.cos(angle) * orbitRadius;
      ship.position.y = Math.sin(angle) * orbitRadius;
      ship.rotation.z = angle - Math.PI / 2;
      
      renderer.render(scene, camera);
    };

    console.log('Starting animation');
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Cleaning up OrbitalRacer');
      window.removeEventListener('resize', handleResize);
      
      planetGeometry.dispose();
      planetMaterial.dispose();
      shipGeometry.dispose();
      shipMaterial.dispose();
      renderer.dispose();
    };
  }, [navigate]);

  return (
    <div>
      <div 
        ref={mountRef}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#000022'
        }}
      />
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: '#444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Back to Home
      </button>
    </div>
  );
}

export default OrbitalRacer;
