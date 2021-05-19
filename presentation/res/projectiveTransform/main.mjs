import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

let camera, scene, renderer, controls;
let container, mesh;
let grid, zAxis, center;
let clock = new THREE.Clock();
let unit = 10;
window.idmat = new THREE.Matrix4();
let shearMatrix = new THREE.Matrix4();
shearMatrix.set(
	1, 0, 0, 0,
	-1, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
)
window.shearMatrix = shearMatrix;

let states = [
	// initial
	_ => {
		mesh.position.set(0,0,-unit);
		mesh.updateMatrix();
		container.rotation.x = 0;
		container.rotation.y = 0;
		container.rotation.z = 0;
	},
	// Translation
	(percentage=1) => {
		mesh.position.set(
			percentage * (-282/5), //285
			percentage *   336/5, //339
			-unit,
		)
		mesh.updateMatrix();
	},
	// Rotation
	(percentage=1) => {
		container.rotation.x = Math.PI/35.2 * percentage;
		container.rotation.y = Math.PI/68.8 * percentage;
		mesh.updateMatrix();
	},
	// Rotation
	(percentage=1) => {
		container.rotation.z = -(Math.PI/4+Math.PI/600) * percentage
		mesh.updateMatrix();
	},
	// Shear
	(percentage=1) => {
		// mesh.updateMatrix();
		// if(percentage==0){
		// 	mesh.userData.previousMatrix = mesh.matrix.clone();
		// 	mesh.userData.previousMatrix.decompose( mesh.position, mesh.quaternion, mesh.scale );
		// }
		// mesh.matrix.copy( mesh.userData.previousMatrix );
		// shearMatrix.set(
		// 	1, 0, 0, 0,
		// 	-0.025, 1, 0, 0,
		// 	0, 0, 1, 0,
		// 	0, 0, 0, 1,
		// )
		if(percentage==0)
			container.applyMatrix4(shearMatrix);
	}
]

let currentState = 0;
let currentPercentage = 1;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 150;

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	controls = new OrbitControls( camera, renderer.domElement );

	scene = new THREE.Scene();

	const texture = new THREE.TextureLoader().load( '../WNF_Konstruktion_animation.png' );
	texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

	const geometry = new THREE.PlaneGeometry(200,200)
	const material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );

	container = new THREE.Group();
	mesh = new THREE.Mesh( geometry, material );
	mesh.matrixAutoUpdate = false;
	container.add( mesh );
	scene.add( container );

	// Grid, zAxis and center

	grid = new THREE.GridHelper(200,20)
	grid.rotateX(Math.PI/2)
	grid.position.set(0,0,0)
	scene.add(grid)

	zAxis = new THREE.Line(
		new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0,0,+100),
			new THREE.Vector3(0,0,-100),
		]),
		new THREE.LineBasicMaterial({ color: 0x544fd8 })
	)
	scene.add(zAxis)

	center = new THREE.Mesh(
		new THREE.SphereGeometry(1.5,10,10),
		new THREE.MeshBasicMaterial({ color: 0x000000 })
	);
	scene.add(center);

	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );

	window.mesh = mesh;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	renderer.render( scene, camera );
	updateState()
	requestAnimationFrame( animate );
}

function updateState(){
	if(currentPercentage >1)
		return
	states[currentState](currentPercentage)
	currentPercentage += 0.01;
}

function nextState(){
	currentState = (currentState + 1) % states.length ;
	currentPercentage = 0;
	console.log(currentState)
}

document.body.onkeyup = ({key: key}) => {
	console.log(key)
	if(key==" ")
		nextState()
}
