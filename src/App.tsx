import { useEffect, useRef } from 'react'
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import camera from './hooks/camera';
import skyMap from "./assets/images/starSky.webp"
import { mercuryObj, venusObj, earthObj, marsObj, jupiterObj, saturnObj, uranusObj, neptuneObj } from './objects/referenceObj';

function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

      const getSize = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
      });

    const { width, height } = getSize();

    // Renderer Config
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement);

    
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 600)
    // const axesHelper = new THREE.AxesHelper(75);
    // const gridHelper = new THREE.GridHelper(220, 50)
    const cubeTextureLoader = new THREE.CubeTextureLoader()

    const cubeTexture = cubeTextureLoader.load([
      skyMap,
      skyMap,
      skyMap,
      skyMap,
      skyMap,
      skyMap
    ])

    cubeTexture.generateMipmaps = false;
    cubeTexture.minFilter = THREE.LinearFilter;
    cubeTexture.magFilter = THREE.LinearFilter;
    cubeTexture.wrapS = THREE.ClampToEdgeWrapping;
    cubeTexture.wrapT = THREE.ClampToEdgeWrapping;

    scene.background = cubeTexture;
    
    // scene.add(axesHelper);
    // scene.add(gridHelper);
    
    // Camera Config
    const orbit = new OrbitControls(camera, renderer.domElement)
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(0, 50, 50);
    orbit.minDistance = 0;
    orbit.maxDistance = 200; 
    orbit.enableDamping = false;
    orbit.dampingFactor = 0.1;
    orbit.enablePan = true
    orbit.update()
    
    const handleResize = () => {
      const { width, height } = getSize();
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };
    
    window.addEventListener('resize', handleResize);

    // PlanetRefs
    let Sun: THREE.Group | null = null;

    const planets = {
      Mercury: null as THREE.Group | null,
      Venus: null as THREE.Group | null,
      Earth: null as THREE.Group | null,
      Mars: null as THREE.Group | null,
      Jupiter: null as THREE.Group | null,
      Saturn: null as THREE.Group | null,
      Uranus: null as THREE.Group | null,
      Neptune: null as THREE.Group | null,
    };

    scene.add(mercuryObj)
    scene.add(venusObj)
    scene.add(earthObj)
    scene.add(marsObj)
    scene.add(jupiterObj)
    scene.add(saturnObj)
    scene.add(uranusObj)
    scene.add(neptuneObj)
    

    //URLS
    const assetLoader = new GLTFLoader()
    const SunURL = new URL("./objects/sun-converted.glb", import.meta.url)
    const MercuryURL = new URL("./objects/mercury-converted.glb", import.meta.url)
    const VenusURL = new URL("./objects/venus-converted.glb", import.meta.url)
    const EarthURL = new URL("./objects/earth-converted.glb", import.meta.url)
    const MarsURL = new URL("./objects/mars-converted.glb", import.meta.url)
    const JupiterURL = new URL("./objects/jupiter-converted.glb", import.meta.url)
    const SaturnURL = new URL("./objects/saturn-converted.glb", import.meta.url)
    const UranusURL = new URL("./objects/uranus-converted.glb", import.meta.url)
    const NeptuneURL = new URL("./objects/neptune-converted.glb", import.meta.url)

    const SolarSystemObj = [
      { key: 'Mercury' as const, url: MercuryURL, scale: 0.02, position: [20, 0, 0], ObjRef: mercuryObj },
      { key: 'Venus' as const, url: VenusURL, scale: 1.5, position: [-5, 0, 35], ObjRef: venusObj },
      { key: 'Earth' as const, url: EarthURL, scale: 0.025, position: [45, 0, -8], ObjRef: earthObj },
      { key: 'Mars' as const, url: MarsURL, scale: 0.03, position: [-52, 0, -12], ObjRef: marsObj },
      { key: 'Jupiter' as const, url: JupiterURL, scale: 0.04, position: [67, 0, 12], ObjRef: jupiterObj },
      { key: 'Saturn' as const, url: SaturnURL, scale: 2, position: [-9, 0, -76], ObjRef: saturnObj },
      { key: 'Uranus' as const, url: UranusURL, scale: 0.00006, position: [-85, 0, -27], ObjRef: uranusObj },
      { key: 'Neptune' as const, url: NeptuneURL, scale: 0.03, position: [100, 0, -7],ObjRef: neptuneObj },
    ];


    // Sun
    assetLoader.load(SunURL.href, function(glb){
      Sun = glb.scene

      scene.add(Sun)
      Sun.scale.setScalar(0.5)
      Sun.position.set(0,4,0)

      const sunLight = new THREE.PointLight(0xffffff, 600, 400, 2);
      Sun.add(sunLight);
      
    }, undefined, function(error){
      console.error(error)
    })

    SolarSystemObj.forEach((planet) => {
      assetLoader.load(
        planet.url.href,
        (glb) => {
          const model = glb.scene;
          const [x, y, z] = planet.position;

          model.scale.setScalar(planet.scale);
          model.position.set(x, y, z);
          model.castShadow = true;

        planet.ObjRef.add(model);

        planets[planet.key] = model;
        },
        undefined,
        (error) => console.error(error)
      );
    });


    function Animation(){

      if (Sun) Sun.rotation.y += 0.001;        
      if (planets.Mercury) planets.Mercury.rotation.y += 0.004; 
      if (planets.Venus) planets.Venus.rotation.y -= 0.002;     
      if (planets.Earth) planets.Earth.rotation.y += 0.003;     
      if (planets.Mars) planets.Mars.rotation.y += 0.003;       
      if (planets.Jupiter) planets.Jupiter.rotation.y += 0.008;
      if (planets.Saturn) planets.Saturn.rotation.y += 0.0007;   
      if (planets.Uranus) planets.Uranus.rotation.y -= 0.006;   
      if (planets.Neptune) planets.Neptune.rotation.y += 0.005;
    
      if (mercuryObj) mercuryObj.rotation.y += 0.006; 
      if (venusObj) venusObj.rotation.y += 0.002;     
      if (earthObj) earthObj.rotation.y += 0.002;     
      if (marsObj) marsObj.rotation.y += 0.002;       
      if (jupiterObj) jupiterObj.rotation.y += 0.0001;
      if (saturnObj) saturnObj.rotation.y += 0.0001;   
      if (uranusObj) uranusObj.rotation.y += 0.0001;   
      if (neptuneObj) neptuneObj.rotation.y += 0.0001;

     
      renderer.render(scene, camera);
    }


    renderer.setAnimationLoop(Animation);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
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
