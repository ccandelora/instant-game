import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { sounds, playSound } from './utils/sounds';

function Home() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000033);
    
    const container = mountRef.current;
    if (!container) {
      console.error('Container ref not found');
      return;
    }
    
    container.appendChild(renderer.domElement);
    console.log('Renderer added to container');

    // Create portal effect with multiple rings
    const createPortal = (color) => {
      const group = new THREE.Group();
      
      // Main portal ring
      const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ring);

      // Inner portal effect (spiral)
      const spiralGeometry = new THREE.BufferGeometry();
      const spiralPoints = [];
      const spiralCount = 100;
      for(let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 20;
        const radius = 1.4 * (1 - i / spiralCount);
        spiralPoints.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
      }
      spiralGeometry.setAttribute('position', new THREE.Float32BufferAttribute(spiralPoints, 3));
      const spiralMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.5
      });
      const spiral = new THREE.Line(spiralGeometry, spiralMaterial);
      group.add(spiral);

      return { group, ring, spiral };
    };

    console.log('Creating portals');
    const games = [
      { name: 'Asteroid Dodger', path: '/asteroid-dodger', color: 0xff4444 },
      { name: 'Orbital Racer', path: '/orbital-racer', color: 0x44ff44 },
      { name: 'Tower Tumble', path: '/tower-tumble', color: 0x4444ff }
    ];

    const portals = games.map((game, index) => {
      const portal = createPortal(game.color);
      const angle = (index / games.length) * Math.PI * 2;
      const radius = 6;
      
      portal.group.position.x = Math.cos(angle) * radius;
      portal.group.position.y = Math.sin(angle) * radius;
      portal.group.userData = { game };
      
      scene.add(portal.group);
      return portal;
    });

    console.log('Portals created:', portals.length);

    // Position camera
    camera.position.z = 15;
    console.log('Camera positioned');

    // Raycaster setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPortal = null;

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        portals.flatMap(portal => portal.group.children)
      );

      if (intersects.length > 0) {
        const newHoveredPortal = intersects[0].object.parent;
        if (hoveredPortal !== newHoveredPortal) {
          if (hoveredPortal) {
            hoveredPortal.scale.set(1, 1, 1);
          }
          hoveredPortal = newHoveredPortal;
          hoveredPortal.scale.set(1.2, 1.2, 1.2);
          playSound(sounds.hover);
        }
      } else if (hoveredPortal) {
        hoveredPortal.scale.set(1, 1, 1);
        hoveredPortal = null;
      }
    };

    const handleClick = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        portals.flatMap(portal => portal.group.children)
      );

      if (intersects.length > 0) {
        const selectedPortal = intersects[0].object.parent;
        playSound(sounds.click);
        setTimeout(() => {
          navigate(selectedPortal.userData.game.path);
        }, 300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate portals
      portals.forEach((portal, index) => {
        portal.ring.rotation.z += 0.005;
        portal.spiral.rotation.z -= 0.01;
        portal.group.position.y += Math.sin(time + index) * 0.005;
      });

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
      console.log('Cleaning up');
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      
      portals.forEach(portal => {
        portal.group.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
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
          background: '#000033'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          width: '100%',
          textAlign: 'center',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        Welcome to Instant Arcade
      </div>
    </div>
  );
}

export default Home;
