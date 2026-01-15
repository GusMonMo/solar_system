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
    scene.fog = new THREE.Fog(0xffffff, 0, 500)
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
    camera.position.set(0, 20, 30);
    orbit.minDistance = 0;
    orbit.maxDistance = 150; 
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
    let Mercury: THREE.Group | null = null;
    let Venus: THREE.Group | null = null;
    let Earth: THREE.Group | null = null;
    let Mars: THREE.Group | null = null;
    let Jupiter: THREE.Group | null = null;
    let Saturn: THREE.Group | null = null;
    let Uranus: THREE.Group | null = null;
    let Neptune: THREE.Group | null = null;

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

    // Sun
    assetLoader.load(SunURL.href, function(glb){
      Sun = glb.scene

      scene.add(Sun)
      Sun.scale.setScalar(0.5)
      Sun.position.set(0,4,0)

      const sunLight = new THREE.PointLight(0xffffff, 300, 300);
      Sun.add(sunLight);
      
    }, undefined, function(error){
      console.error(error)
    })

    //Mercury
    assetLoader.load(MercuryURL.href, function(glb){
      Mercury = glb.scene

      if (mercuryObj) mercuryObj.add(Mercury)
      Mercury.scale.setScalar(0.02)
      Mercury.position.set(20,4,0)
      Mercury.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })

    //Venus
    assetLoader.load(VenusURL.href, function(glb){
      Venus = glb.scene

      if (venusObj) venusObj.add(Venus)
      Venus.scale.setScalar(1.5)
      Venus.position.set(-5,4,35)
      Venus.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Earth
    assetLoader.load(EarthURL.href, function(glb){
      Earth = glb.scene

      if (earthObj) earthObj.add(Earth)
      Earth.scale.setScalar(0.025)
      Earth.position.set(45,4,-8)
      Earth.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Mars
      assetLoader.load(MarsURL.href, function(glb){
      Mars = glb.scene

      if (marsObj) marsObj.add(Mars)
      Mars.scale.setScalar(0.03)
      Mars.position.set(-55,4,-12)
      Mars.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Jupiter
      assetLoader.load(JupiterURL.href, function(glb){
      Jupiter = glb.scene

      if (jupiterObj) jupiterObj.add(Jupiter)
      Jupiter.scale.setScalar(0.04)
      Jupiter.position.set(65, 4, 12)
      Jupiter.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Saturn
    assetLoader.load(SaturnURL.href, function(glb){
      Saturn = glb.scene

      if (saturnObj) saturnObj.add(Saturn)
      Saturn.scale.setScalar(2)
      Saturn.position.set(-9, 4, -76)
      Saturn.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Uranus
    assetLoader.load(UranusURL.href, function(glb){
      Uranus = glb.scene

      if (uranusObj) uranusObj.add(Uranus)
      Uranus.scale.setScalar(0.00006)
      Uranus.position.set(-85, 4, -27)
      Uranus.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })
    //Neptune
    assetLoader.load(NeptuneURL.href, function(glb){
      Neptune = glb.scene

      if (neptuneObj) neptuneObj.add(Neptune)
      Neptune.scale.setScalar(0.03)
      Neptune.position.set(100, 4, -7)
      Neptune.castShadow = true
      
    }, undefined, function(error){
      console.error(error)
    })


    function Animation(){

      if (Sun) Sun.rotation.y += 0.001;        
      if (Mercury) Mercury.rotation.y += 0.004; 
      if (Venus) Venus.rotation.y -= 0.002;     
      if (Earth) Earth.rotation.y += 0.003;     
      if (Mars) Mars.rotation.y += 0.003;       
      if (Jupiter) Jupiter.rotation.y += 0.008;
      if (Saturn) Saturn.rotation.y += 0.007;   
      if (Uranus) Uranus.rotation.y -= 0.006;   
      if (Neptune) Neptune.rotation.y += 0.005;
    
      if (mercuryObj) mercuryObj.rotation.y += 0.006; 
      if (venusObj) venusObj.rotation.y += 0.002;     
      if (earthObj) earthObj.rotation.y += 0.002;     
      if (marsObj) marsObj.rotation.y += 0.002;       
      if (jupiterObj) jupiterObj.rotation.y += 0.0002;
      if (saturnObj) saturnObj.rotation.y += 0.0002;   
      if (uranusObj) uranusObj.rotation.y += 0.0002;   
      if (neptuneObj) neptuneObj.rotation.y += 0.0002;

     
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
