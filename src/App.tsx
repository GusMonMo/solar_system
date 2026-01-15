import { useEffect, useRef } from 'react'
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import camera from './hooks/camera';
import skyMap from "./assets/images/starSky.webp"

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const isDisposedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Previne múltiplas inicializações
    if (rendererRef.current) return
    
    isDisposedRef.current = false

    const getSize = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const { width, height } = getSize();

    // Detecta iOS para ajustes específicos
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Renderer Config - OTIMIZADO PARA iOS
    const renderer = new THREE.WebGLRenderer({
      antialias: !isIOS, // Desativa antialiasing no iOS para economizar memória
      powerPreference: isIOS ? "low-power" : "high-performance",
      precision: isIOS ? "mediump" : "highp",
    });
    
    rendererRef.current = renderer
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isIOS ? 2 : 3));
    renderer.shadowMap.enabled = !isIOS; // Desativa sombras no iOS
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene
    scene.fog = new THREE.Fog(0x000011, 50, 200)

    // Skybox otimizado - usa uma única textura
    const textureLoader = new THREE.TextureLoader()
    const skyTexture = textureLoader.load(skyMap)
    scene.background = skyTexture

    // Camera Config
    const orbit = new OrbitControls(camera, renderer.domElement)
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(0, 20, 30);
    orbit.minDistance = 5;
    orbit.maxDistance = 100; 
    orbit.enableDamping = false;
    orbit.enablePan = true
    orbit.update()
    
    const handleResize = () => {
      if (isDisposedRef.current) return
      const { width, height } = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    // Debounce resize para iOS
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);

    // Refs dos planetas
    const planets: THREE.Group[] = [];
    let Sun: THREE.Group | null = null;

    // Loader com gerenciamento de memória
    const assetLoader = new GLTFLoader()
    
    // Carrega modelos SEQUENCIALMENTE para evitar memory pressure
    const loadQueue = [
      { url: "./objects/sun-converted.glb", scale: 0.5, pos: [0,0,0], isSun: true },
      { url: "./objects/mercury-converted.glb", scale: 0.02, pos: [20,0,0] },
      { url: "./objects/venus-converted.glb", scale: 1.5, pos: [-5,0,26] },
      { url: "./objects/earth-converted.glb", scale: 0.025, pos: [30,0,-8] },
      { url: "./objects/mars-converted.glb", scale: 0.03, pos: [-36,0,-12] },
      { url: "./objects/jupiter-converted.glb", scale: 0.04, pos: [40,0,12] },
      { url: "./objects/saturn-converted.glb", scale: 2, pos: [-9,0,-49] },
      { url: "./objects/uranus-converted.glb", scale: 0.00006, pos: [-58,0,-27] },
      { url: "./objects/neptune-converted.glb", scale: 0.03, pos: [60,0,-7] },
    ];

    // Carregamento sequencial
    const loadModels = async () => {
      for (const item of loadQueue) {
        if (isDisposedRef.current) return; // Para se o componente foi desmontado
        
        try {
          const url = new URL(item.url, import.meta.url);
          const glb = await assetLoader.loadAsync(url.href);
          
          if (isDisposedRef.current) return;
          
          const model = glb.scene;
          model.scale.setScalar(item.scale);
          model.position.set(item.pos[0], item.pos[1], item.pos[2]);
          
          if (item.isSun) {
            Sun = model;
            scene.add(model);
            const sunLight = new THREE.PointLight(0xffffff, 300, 300);
            model.add(sunLight);
          } else if (Sun) {
            Sun.add(model);
            model.castShadow = !isIOS;
          }
          
          planets.push(model);
        } catch (error) {
          console.error('Erro ao carregar modelo:', item.url, error);
        }
      }
    };

    loadModels();

    // Animation loop otimizado
    const rotationSpeeds = [0.001, 0.004, -0.002, 0.003, 0.003, 0.008, 0.007, -0.006, 0.005];
    
    function animate() {
      if (isDisposedRef.current) return;
      
      animationIdRef.current = requestAnimationFrame(animate);
      
      planets.forEach((planet, i) => {
        if (planet) planet.rotation.y += rotationSpeeds[i] || 0.003;
      });
      
      renderer.render(scene, camera);
    }

    animate();

    // Cleanup completo
    return () => {
      isDisposedRef.current = true;
      
      // Para o animation loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      
      // Dispõe geometrias e materiais
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      
      // Dispõe texturas
      skyTexture.dispose();
      
      // Dispõe renderer
      renderer.dispose();
      renderer.forceContextLoss();
      
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      rendererRef.current = null;
      sceneRef.current = null;
    };

  }, [])

  return (
    <section className='w-full min-w-screen h-full min-h-screen relative flex flex-col fullcentral'>
      <header className='w-[80%] h-auto absolute flex fullcentral top-[1vh] left-1/2 -translate-x-1/2 
      bg-blue-900/40 backdrop-blur-[0.5vh] border-white border-[0.5vh] rounded-full py-[1vh]'>
        <h1 className='font-extrabold text-white'>The Solar System</h1>
      </header>
      <main className='w-full h-full flex fullcentral'>
        <div ref={containerRef} className='w-full h-full'/>
      </main>
    </section>
  )
}

export default App