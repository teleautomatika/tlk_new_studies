import * as THREE from 'three';
import { gsap } from 'gsap';

class NeuronAnimation {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private neuronGroup: THREE.Group;
    private dendrites: THREE.Line[] = [];
    private time: number = 0;
    private glowMaterial: THREE.ShaderMaterial;
    private expansionFactor: number = 1;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.camera.position.z = 5;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        
        const container = document.getElementById('neuron-container');
        if (!container) return;
        
        this.renderer.setSize(400, 400);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        this.glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0.3 },
                color: { value: new THREE.Color(0xffffff) },
                expansion: { value: 1.0 }
            },
            vertexShader: `
                uniform float expansion;
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position * expansion;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float glow = sin(time * 1.5) * 0.3 + 0.7;
                    float pulse = sin(time * 2.0 + length(vPosition)) * 0.2 + 0.8;
                    vec3 finalColor = color * (intensity + glow * 0.3 + pulse * 0.2);
                    float alpha = smoothstep(0.5, 0.0, length(vUv - 0.5));
                    gl_FragColor = vec4(finalColor, alpha * (0.7 + pulse * 0.3));
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.neuronGroup = new THREE.Group();
        this.scene.add(this.neuronGroup);
        
        this.createNeuron();
        
        container.addEventListener('mouseenter', () => this.onHover(true));
        container.addEventListener('mouseleave', () => this.onHover(false));
        container.addEventListener('click', () => this.handleClick());
        
        this.animate();
    }

    private createNeuron() {
        const somaGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const somaMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const soma = new THREE.Mesh(somaGeometry, somaMaterial);
        this.neuronGroup.add(soma);

        const glowSizes = [0.15, 0.18, 0.21];
        glowSizes.forEach(size => {
            const glowGeometry = new THREE.SphereGeometry(size, 32, 32);
            const glowMesh = new THREE.Mesh(glowGeometry, this.glowMaterial.clone());
            soma.add(glowMesh);
        });

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
        pointLight.position.set(2, 2, 4);
        const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
        pointLight2.position.set(-2, -2, 4);
        this.scene.add(ambientLight, pointLight, pointLight2);

        this.createDendrites();
    }

    private createDendrites() {
        const numDendrites = 16;
        const baseLength = 1.5;
        
        for (let i = 0; i < numDendrites; i++) {
            const angle = (i / numDendrites) * Math.PI * 2;
            const length = baseLength + Math.random() * 0.3;
            
            const points = [];
            const segments = 12;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const radius = length * t;
                const wave = Math.sin(t * Math.PI * 2) * 0.15;
                const twist = t * Math.PI * 0.2;
                points.push(new THREE.Vector3(
                    Math.cos(angle + wave + twist) * radius,
                    Math.sin(angle + wave + twist) * radius,
                    Math.sin(t * Math.PI) * 0.1
                ));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4
            });

            const dendrite = new THREE.Line(geometry, material);
            this.dendrites.push(dendrite);
            this.neuronGroup.add(dendrite);
        }
    }

    private onHover(isHovered: boolean) {
        const targetScale = isHovered ? 1.2 : 1;
        const targetOpacity = isHovered ? 0.8 : 0.4;
        const targetEmissive = isHovered ? 1 : 0.3;
        const targetExpansion = isHovered ? 1.3 : 1;

        gsap.to(this.neuronGroup.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 1.2,
            ease: "power2.out"
        });

        gsap.to(this, {
            expansionFactor: targetExpansion,
            duration: 1.2,
            ease: "power2.out"
        });

        this.dendrites.forEach((dendrite, index) => {
            gsap.to(dendrite.material, {
                opacity: targetOpacity,
                duration: 0.8,
                delay: index * 0.03
            });
        });

        gsap.to(this.glowMaterial.uniforms.intensity, {
            value: isHovered ? 0.6 : 0.3,
            duration: 0.8
        });

        const soma = this.neuronGroup.children[0] as THREE.Mesh;
        const material = soma.material as THREE.MeshPhongMaterial;
        gsap.to(material, {
            emissiveIntensity: targetEmissive,
            duration: 0.8
        });
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.time += 0.002;

        this.glowMaterial.uniforms.time.value = this.time;
        this.glowMaterial.uniforms.expansion.value = this.expansionFactor;

        this.neuronGroup.rotation.z = Math.sin(this.time * 0.2) * 0.05;

        this.dendrites.forEach((dendrite, index) => {
            const material = dendrite.material as THREE.LineBasicMaterial;
            const pulsePhase = Math.sin(this.time + index * 0.2) * 0.1;
            material.opacity = 0.4 + pulsePhase;
            
            const points = dendrite.geometry.attributes.position.array;
            for (let i = 3; i < points.length; i += 3) {
                const t = i / points.length;
                points[i + 0] += Math.sin(this.time * 0.5 + i + index) * 0.0003;
                points[i + 1] += Math.cos(this.time * 0.5 + i + index) * 0.0003;
                points[i + 2] = Math.sin(t * Math.PI + this.time) * 0.1;
            }
            dendrite.geometry.attributes.position.needsUpdate = true;
        });

        this.renderer.render(this.scene, this.camera);
    }

    private handleClick() {
        window.location.href = '/src/login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuronAnimation();
});