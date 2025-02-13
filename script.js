// Função para alternar a visibilidade do painel de controle e trocar o ícone entre olho e olho cortado
function toggleControlPanel() {
  const panel = document.getElementById('controlPanel');
  const icon = document.getElementById('toggleIcon');
  panel.classList.toggle('hidden');
  icon.classList.toggle('fa-eye-slash');
  icon.classList.toggle('fa-eye');
}

// Variáveis globais para cena, câmera, renderizador, controles e lista de objetos
let scene, camera, renderer, controls;
let cubes = []; // Vetor que conterá todos os objetos adicionados (cubos, esferas, cilindros)
let selectedCube = null;

// Variável global para o grid helper (plano cartesiano)
let gridHelper;

function init() {
  // Cria a cena
  scene = new THREE.Scene();

  // Configura a câmera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Cria o renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('viewer-container').appendChild(renderer.domElement);

  // Adiciona controles orbitais
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera.position.set(10, 10, 10);
  controls.update();

  // Adiciona luz ambiente e direcional
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Cria e adiciona o grid helper (plano cartesiano)
  gridHelper = new THREE.GridHelper(50, 50);
  scene.add(gridHelper);

  // Atualiza a cena quando a janela for redimensionada
  window.addEventListener('resize', onWindowResize);

  // Adiciona evento de clique para selecionar objetos
  renderer.domElement.addEventListener('click', onCanvasClick);

  // Inicia a animação
  animate();
}

// Seleciona um objeto e atualiza os controles
function selectCube(cube) {
  if (selectedCube) selectedCube.material.emissive.setHex(0x000000);
  selectedCube = cube;
  selectedCube.material.emissive.setHex(0x444444);
  updateControlValues();
}

// Atualiza os valores dos controles de posição, escala e cor
function updateControlValues() {
  if (selectedCube) {
    document.getElementById('posX').value = selectedCube.position.x;
    document.getElementById('posY').value = selectedCube.position.y;
    document.getElementById('posZ').value = selectedCube.position.z;

    document.getElementById('scaleX').value = selectedCube.scale.x;
    document.getElementById('scaleY').value = selectedCube.scale.y;
    document.getElementById('scaleZ').value = selectedCube.scale.z;

    document.getElementById('cubeColor').value = `#${selectedCube.material.color.getHexString()}`;
  }
}

// Atualiza a posição do objeto conforme os controles (sliders)
function updateCubePosition() {
  if (selectedCube) {
    selectedCube.position.set(
      parseFloat(document.getElementById('posX').value),
      parseFloat(document.getElementById('posY').value),
      parseFloat(document.getElementById('posZ').value)
    );
  }
}

// Atualiza a escala do objeto conforme os controles (sliders)
function updateCubeScale() {
  if (selectedCube) {
    selectedCube.scale.set(
      parseFloat(document.getElementById('scaleX').value),
      parseFloat(document.getElementById('scaleY').value),
      parseFloat(document.getElementById('scaleZ').value)
    );
  }
}

// Atualiza a cor do objeto com base no input do tipo "color"
function updateCubeColor() {
  if (selectedCube) {
    selectedCube.material.color.set(document.getElementById('cubeColor').value);
  }
}

// Evento para aplicar textura ao objeto selecionado
document.getElementById('texture-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && selectedCube) {
    applyTextureToSelectedObject(file, selectedCube);
  } else {
    console.warn("Nenhum objeto selecionado para aplicar a textura.");
  }
});

// Função para mesclar os objetos existentes em um único objeto
function mergeCubes() {
  if (cubes.length < 2) return;

  const combinedGeometry = new THREE.BufferGeometry();
  const material = cubes[0].material.clone();

  cubes.forEach((obj) => {
    obj.updateMatrixWorld();
    const geometry = obj.geometry.clone().applyMatrix4(obj.matrixWorld);
    combinedGeometry.merge(geometry);
  });

  const mergedMesh = new THREE.Mesh(combinedGeometry, material);
  scene.add(mergedMesh);

  cubes.forEach((obj) => scene.remove(obj));
  cubes = [mergedMesh];
  selectCube(mergedMesh);
}

// Atualiza as dimensões da cena quando a janela for redimensionada
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Detecta cliques na cena para selecionar objetos
function onCanvasClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cubes);
  if (intersects.length > 0) {
    selectCube(intersects[0].object);
  }
}

// Loader para modelos 3D
const loader = new THREE.GLTFLoader();

// Função para dar zoom in ou out alterando o campo de visão da câmera
function handleZoom(action) {
  if (action === 'in') {
    camera.fov /= 1.1;
  } else {
    camera.fov *= 1.1;
  }
  camera.fov = Math.max(10, Math.min(100, camera.fov));
  camera.updateProjectionMatrix();
}

// Função para alternar a exibição do grid helper (plano cartesiano)
function toggleGrid() {
  if (gridHelper.parent === null) {
    scene.add(gridHelper);
  } else {
    scene.remove(gridHelper);
  }
}

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Evento para carregar arquivos de modelos 3D
document.getElementById('file-input').addEventListener('change', (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      loadModel(files[i]); // Carrega cada modelo separadamente
    }
  }
});

// Função para carregar modelos 3D
function loadModel(file) {
  const url = URL.createObjectURL(file);
  loader.load(
    url,
    (gltf) => {
      const newModel = gltf.scene;
      scene.add(newModel);

      // Ajusta a posição do novo modelo para evitar sobreposição
      const bbox = new THREE.Box3().setFromObject(newModel);
      const size = bbox.getSize(new THREE.Vector3());
      newModel.position.set(
        Math.random() * 5 - 2.5, // Posição X aleatória
        size.y / 2,              // Posição Y ajustada pela altura do modelo
        Math.random() * 5 - 2.5  // Posição Z aleatória
      );

      cubes.push(newModel);
      selectCube(newModel);

      URL.revokeObjectURL(url);
    },
    undefined,
    (error) => {
      console.error('Erro ao carregar modelo:', error);
    }
  );
}

// Função para aplicar textura ao objeto selecionado
function applyTextureToSelectedObject(file, object) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(event.target.result, function (texture) {
      object.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.map = texture;
              mat.needsUpdate = true;
            });
          } else {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        }
      });
    });
  };

  reader.readAsDataURL(file);
}

// Função para alternar entre modo claro e escuro
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("themeIcon");

  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    localStorage.setItem("theme", "light");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    localStorage.setItem("theme", "dark");
  }
}

// Carrega a preferência de tema e inicia a aplicação quando a página é carregada
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    document.getElementById("themeIcon").classList.replace("fa-moon", "fa-sun");
  }
  init();
});
