import React, {Component} from 'react';
import wagon from './gwagon.drc';
import { DRACOLoader } from 'three-full'
const THREE = require('three-full')
const OrbitControls = require('three-orbitcontrols');

export default class GWagon extends Component {

    constructor() {
        super();
        this.lastMousePosition = {};
        this.width = 0;
        this.height = 0;
        this.rotateSpeed = 0.005;
        this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
        this.animate = this.animate.bind(this);
    }

    componentDidMount() {
        this.width = this.divElement.offsetWidth;
        this.height = this.divElement.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.divElement.appendChild(this.renderer.domElement);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1,  50);
        this.camera.position.set(0, 3, 10);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.maxPolarAngle = Math.PI/2 - 0.1;
        this.controls.minPolarAngle = 0.8;
        this.controls.update();

        this.scene = new THREE.Scene();
        this.totalGroup = new THREE.Group();
        this.scene.add(this.totalGroup);

        var ambient = new THREE.AmbientLight(0x222222, 0.4);
        this.scene.add(ambient);

        var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
        light.position.set( 10, 10, 10 );
        light.castShadow = true;
        this.scene.add( light );
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 30;

        for (let i = -2; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (j === 0 && (i !== -2 && i !== 2)) continue;
                var subLight = new THREE.PointLight( 0x222222, 0.8, 2.7 );
                var posZ = i * 2.2;
                subLight.position.set(j * 2.5, 0.5, posZ);
                this.totalGroup.add(subLight);
            }
        }

        var self = this;
        DRACOLoader.setDecoderPath('js/draco/');
        DRACOLoader.setDecoderConfig({type: 'js'});
        var dracloader = new DRACOLoader();

        dracloader.load(
            wagon, 
            function(object) {
                object.computeVertexNormals();
				var material = new THREE.MeshStandardMaterial( { color: 0x505050 } );
				var mesh = new THREE.Mesh( object, material );
				mesh.castShadow = false;
                mesh.posZ += 1.3;
                mesh.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.color.setHex(0x505050);
                    }
                })
                var scaleVal = 0.1;
                mesh.scale.set(scaleVal, scaleVal, scaleVal);
				mesh.receiveShadow = true;
				DRACOLoader.releaseDecoderModule();
                self.totalGroup.add(mesh);
            },
            function ( xhr ) {
		        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	        },
            // called when loading has errors
	        function ( error ) {
		        console.log( 'An error happened' );
	        }
        );

        this.animate();

        window.addEventListener('wheel', function(e) {
            if (e.deltaY > 0 && self.rotateSpeed < 0.021) self.rotateSpeed += 0.021;
            if (e.deltaY < 0 && self.rotateSpeed >-0.021) self.rotateSpeed -= 0.021;
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        this.totalGroup.rotation.y += this.rotateSpeed;
    }

    render() {
        return (
            <div className="gwagon-wrapper" ref={ (divElement) => this.divElement = divElement}>
                
            </div>
        );
    }
}
