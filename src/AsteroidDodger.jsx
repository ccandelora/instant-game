import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

function AsteroidDodger() {
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameStateRef = useRef({
    scene: null,
    ship: null,
    asteroids: [],
    powerUps: [],
    playerAlive: true,
    gameSpeed: 0.1,
    shieldActive: false,
    speedBoost: false,
    frameCount: 0,
    renderer: null,
    camera: null,
    animationFrameId: null
  });
  const keys = useRef({ left: false, right: false });

  // Move these functions outside useEffect
  const createAsteroid = useCallback(() => {
    const state = gameStateRef.current;
    const size = Math.random() * 0.8 + 0.5;
    const geometry = new THREE.DodecahedronGeometry(size);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x888888,
      shininess: 30,
      emissive: 0x222222,
      emissiveIntensity: 0.2
    });
    const asteroid = new THREE.Mesh(geometry, material);
    
    asteroid.position.x = Math.random() * 20 - 10;
    asteroid.position.y = 20;
    asteroid.position.z = Math.random() * 2 - 1;
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    
    state.scene.add(asteroid);
    state.asteroids.push(asteroid);
  }, []);

  const createPowerUp = useCallback(() => {
    const state = gameStateRef.current;
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      shininess: 200
    });
    const powerUp = new THREE.Mesh(geometry, material);
    
    powerUp.position.x = Math.random() * 20 - 10;
    powerUp.position.y = 15;
    powerUp.position.z = 0;
    powerUp.type = Math.random() < 0.5 ? 'shield' : 'speed';
    
    state.scene.add(powerUp);
    state.powerUps.push(powerUp);
  }, []);

  // Define animate first without startGame dependency
  const animate = useCallback(() => {
    const state = gameStateRef.current;
    
    // Only check playerAlive, not isPlaying
    if (!state.playerAlive) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    // Ship movement
    const moveSpeed = state.speedBoost ? 0.5 : 0.3;
    
    if (keys.current.left && state.ship.position.x > -10) {
      state.ship.position.x -= moveSpeed;
    }
    if (keys.current.right && state.ship.position.x < 10) {
      state.ship.position.x += moveSpeed;
    }

    // Create new asteroid and occasionally power-ups
    if (state.frameCount % 60 === 0) {
      createAsteroid();
      if (Math.random() < 0.1) createPowerUp();
      setScore(prev => prev + 10);
      state.gameSpeed += 0.001;
    }

    // Move and check collisions
    state.asteroids.forEach((asteroid, index) => {
      asteroid.position.y -= state.gameSpeed;
      asteroid.rotation.x += 0.01;
      asteroid.rotation.y += 0.01;
      
      if (asteroid.position.y < -10) {
        state.scene.remove(asteroid);
        state.asteroids.splice(index, 1);
      }

      // Collision detection
      const shipBounds = new THREE.Box3().setFromObject(state.ship);
      const asteroidBounds = new THREE.Box3().setFromObject(asteroid);
      
      if (!state.shieldActive && shipBounds.intersectsBox(asteroidBounds)) {
        state.playerAlive = false;
        setGameOver(true);
        setIsPlaying(false);
        return;
      }
    });

    state.frameCount++;
    state.renderer.render(state.scene, state.camera);

    // Continue animation if game is still running
    if (state.playerAlive) {
      state.animationFrameId = requestAnimationFrame(animate);
    }
  }, [createAsteroid, createPowerUp]); // Remove isPlaying from dependencies

  // Define startGame without animate dependency
  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    
    // Cancel any existing animation frame
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }
    
    // Clear existing objects
    state.asteroids.forEach(asteroid => {
      state.scene.remove(asteroid);
    });
    state.asteroids.length = 0;

    state.powerUps.forEach(powerUp => {
      state.scene.remove(powerUp);
    });
    state.powerUps.length = 0;

    // Reset ship position
    if (state.ship) {
      state.ship.position.set(0, -5, 0);
      state.ship.rotation.z = 0;
    }

    // Reset game state
    state.playerAlive = true;
    state.gameSpeed = 0.1;
    state.shieldActive = false;
    state.speedBoost = false;
    state.frameCount = 0;

    // Reset UI state and start game
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);

    // Start new animation immediately
    requestAnimationFrame(animate);
  }, [animate]);

  // Update keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      keys.current.left = true;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      keys.current.right = true;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      keys.current.left = false;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      keys.current.right = false;
    }
  }, []);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    gameStateRef.current.scene = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000033, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = mountRef.current;
    if (!container) return;
    
    // Clear any existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    container.appendChild(renderer.domElement);

    // Add background color to container
    container.style.backgroundColor = '#000033';

    // Improved lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 20);
    scene.add(pointLight);

    // Add a second point light for better illumination
    const pointLight2 = new THREE.PointLight(0x8888ff, 0.5, 100);
    pointLight2.position.set(0, -10, 10);
    scene.add(pointLight2);

    // Player ship with advanced design
    const shipGeometry = new THREE.Group();
    
    // Main body (fuselage)
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.5, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xc0392b,
      shininess: 100,
      emissive: 0x922b21,
      emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    shipGeometry.add(body);

    // Wings (delta shape)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.5, -1);
    wingShape.lineTo(0, -1);
    wingShape.lineTo(0, 0);
    
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.1,
      bevelEnabled: false
    });
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x7f8c8d,
      shininess: 80,
      emissive: 0x2c3e50,
      emissiveIntensity: 0.2
    });
    
    // Left wing
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.2, 0, 0);
    leftWing.rotation.y = Math.PI / 2;
    shipGeometry.add(leftWing);

    // Right wing (mirror of left wing)
    const rightWing = leftWing.clone();
    rightWing.position.set(0.2, 0, 0);
    rightWing.rotation.y = -Math.PI / 2;
    shipGeometry.add(rightWing);

    // Cockpit (streamlined)
    const cockpitGeometry = new THREE.CapsuleGeometry(0.2, 0.3, 4, 8);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x3498db,
      shininess: 150,
      transparent: true,
      opacity: 0.7,
      emissive: 0x2980b9,
      emissiveIntensity: 0.5
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 0.5;
    cockpit.rotation.x = Math.PI / 2;
    shipGeometry.add(cockpit);

    // Engine thrusters
    const thrusterGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.3, 8);
    const thrusterMaterial = new THREE.MeshPhongMaterial({
      color: 0x95a5a6,
      shininess: 100
    });
    
    // Left thruster
    const leftThruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
    leftThruster.position.set(-0.3, -0.8, 0);
    shipGeometry.add(leftThruster);

    // Right thruster
    const rightThruster = leftThruster.clone();
    rightThruster.position.set(0.3, -0.8, 0);
    shipGeometry.add(rightThruster);

    // Create the final ship mesh
    const ship = shipGeometry;
    ship.rotation.x = -Math.PI / 2;
    ship.rotation.z = Math.PI;
    ship.scale.set(0.8, 0.8, 0.8);
    scene.add(ship);
    gameStateRef.current.ship = ship;

    // Position camera and ship
    camera.position.z = 15;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    // Reset ship position
    ship.position.set(0, -5, 0);
    ship.rotation.x = Math.PI / 2;
    ship.rotation.y = Math.PI;

    // Particle system for ship thrusters
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff4500,
      size: 0.1,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = -1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    ship.add(particles);

    // Store renderer and camera in gameState
    gameStateRef.current.renderer = renderer;
    gameStateRef.current.camera = camera;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Don't start animation automatically
    // Just set up the scene

    // Add resize handler
    const handleResize = () => {
      const { camera, renderer } = gameStateRef.current;
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Add a starfield for better depth perception
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 200 - 100;
      const z = Math.random() * 200 - 100;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Cleanup
    return () => {
      const state = gameStateRef.current;
      setIsPlaying(false);
      
      // Cancel animation frame
      if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
      }

      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (gameStateRef.current.renderer) {
        gameStateRef.current.renderer.dispose();
      }
      if (gameStateRef.current.scene) {
        gameStateRef.current.scene.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div style={{ 
      position: 'relative',
      backgroundColor: '#000033',
      width: '100vw',
      height: '100vh'
    }}>
      <div 
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      />
      {!isPlaying && !gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '48px',
          textAlign: 'center'
        }}>
          Asteroid Dodger<br/>
          <button 
            onClick={startGame}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={e => e.target.style.backgroundColor = '#4CAF50'}
          >
            Start Game
          </button>
        </div>
      )}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: 'white',
          fontSize: '18px',
          textAlign: 'right',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Controls:<br/>
          ← → or A/D to move<br/>
          Score: {score}
        </div>
      )}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '48px',
          textAlign: 'center'
        }}>
          Game Over!<br/>
          Final Score: {score}<br/>
          <button 
            onClick={startGame}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={e => e.target.style.backgroundColor = '#4CAF50'}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default AsteroidDodger;
