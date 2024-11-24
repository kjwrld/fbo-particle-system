import * as THREE from 'three';

export default class FBO {
  width: number;
  height: number;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  rtt: THREE.WebGLRenderTarget;
  mesh: THREE.Mesh;

  constructor(
    width: number, 
    height: number, 
    renderer: THREE.WebGLRenderer,
    simulationMaterial: THREE.ShaderMaterial,
    renderMaterial: THREE.ShaderMaterial
  ) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;

    // Setup simulation scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    // Create render target
    this.rtt = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    });

    // Create simulation mesh
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', 
      new THREE.BufferAttribute(
        new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,-1,0, 1,1,0, -1,1,0]),
        3
      )
    );
    geometry.setAttribute('uv',
      new THREE.BufferAttribute(
        new Float32Array([0,1, 1,1, 1,0, 0,1, 1,0, 0,0]),
        2
      )
    );
    this.mesh = new THREE.Mesh(geometry, simulationMaterial);
    this.scene.add(this.mesh);

    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      positions[i * 3] = (i % width) / width;
      positions[i * 3 + 1] = Math.floor(i / width) / height;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles = new THREE.Points(particleGeometry, renderMaterial);
  }

  update(time: number) {
    // Update simulation
    this.renderer.setRenderTarget(this.rtt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Update particles
    this.particles.material.uniforms.positions.value = this.rtt.texture;
    this.particles.material.uniforms.uTime.value = time;
  }
}