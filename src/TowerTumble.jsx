import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

function TowerTumble() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Initializing TowerTumble');
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue
    
    const container = mountRef.current;
    if (!container) {
      console.error('Container ref not found');
      return;
    }
    
    container.appendChild(renderer.domElement);
    console.log('Renderer added to container');

    // Create ground
    const groundGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -5;
    scene.add(ground);

    // Create initial block
    const blockGeometry = new THREE.BoxGeometry(2, 1, 2);
    const blockMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.position.set(-5, -4, 0);
    scene.add(block);

    // Position camera
    camera.position.set(0, 0, 15);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Move block back and forth
      block.position.x = -5 + Math.sin(Date.now() * 0.002) * 5;
      
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
      console.log('Cleaning up TowerTumble');
      window.removeEventListener('resize', handleResize);
      
      groundGeometry.dispose();
      groundMaterial.dispose();
      blockGeometry.dispose();
      blockMaterial.dispose();
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
          background: '#87CEEB'
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
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          width: '100%',
          textAlign: 'center',
          color: 'white',
          fontSize: '24px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        Press SPACE to place blocks
      </div>
    </div>
  );
}

export default TowerTumble;
