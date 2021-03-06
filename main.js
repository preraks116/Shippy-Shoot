import './style.css'


import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Camera, Vector3 } from 'three';

let camera;
let scene;
let renderer;
let water, sun;
let score = 0;
let time = 0;
let health = 100;
let enemySpeed = -0.1
let viewBool = 0
let cameravector = new THREE.Vector3(0, 35.5, 80)
let shipForward = new THREE.Vector3(0, 0, -1);

const Y_Axis = new Vector3(0,1,0)
const loader = new GLTFLoader();

let PlayerBallsList = []
let EnemyBallsList = []
let treasureList = []

let keyPressed = {
  "w": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.vel = 1
    }
  },
  "a": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.rot = 0.01
    }
  },
  "s": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.vel = -1
    }
  },
  "d": {
    "pressed": 0,
    f: () => {
      PlayerBoat.speed.rot = -0.01
    }
  },
  "h": {
    "pressed": 0,
    f: () => {
      // cannonBallList.push(new cannonBall(PlayerBoat.boat.position.x,PlayerBoat.boat.position.y,PlayerBoat.boat.position.z, shipForward));
      PlayerBallsList.push(new cannonBall(PlayerBoat.boat.position.x,PlayerBoat.boat.position.y,PlayerBoat.boat.position.z, shipForward));
    }
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

//function to get random angle between 0 and 2*PI
function getRandomAngle(){
  return Math.random() * 2 * Math.PI
}

// initial vector looking at the sun


function updatecamera(){
  if(PlayerBoat.speed.vel)
  {
    camera.position.sub(shipForward.clone().multiplyScalar(-1*PlayerBoat.speed.vel))  
  }
  if(PlayerBoat.speed.rot)
  {
    // rotate shipForward
    shipForward.applyAxisAngle(Y_Axis, PlayerBoat.speed.rot)
    if(viewBool == 0)
    {
      camera.position.x = PlayerBoat.boat.position.x + cameravector.x
      camera.position.y = PlayerBoat.boat.position.y + cameravector.y
      camera.position.z = PlayerBoat.boat.position.z + cameravector.z
      camera.lookAt(PlayerBoat.boat.position)
    }
  }
  cameravector.applyAxisAngle(Y_Axis, PlayerBoat.speed.rot)
}

//creating a boat class
class Boat {
  constructor(){
    loader.load("assets/boat/scene2.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(5, 5, 5)
      gltf.scene.position.set(0,-1.5,-80)
      this.boat = gltf.scene
      this.isDead = 0
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  stop(){
    if(!keyPressed.w.pressed || !keyPressed.s.pressed)
    {
      this.speed.vel = 0
    }
    if(!keyPressed.a.pressed || !keyPressed.d.pressed)
    {
      this.speed.rot = 0
    }
  }

  update(){
    if(this.boat){
      updatecamera();
      this.boat.rotation.y += this.speed.rot
      this.boat.translateZ(-1*this.speed.vel)
    }
  }
}

// creating a cannonball class
class cannonBall {
  constructor(x,y,z,w){
    // console.log(x,y,z) 
    loader.load("assets/cannonBall/untitled.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(30, 30, 30)
      gltf.scene.position.set(x,5,z)
      this.initDirection = w.clone()
      this.ball = gltf.scene
      this.destroyed = 0
      this.speed = {
        vel: 1,
        rot: 0
      }
    })
  }

  stop(){
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update(){
    if(this.ball){
      this.ball.position.add(this.initDirection)
    }
  }
}

// creating an ememy boat class 
class Enemy {
  constructor(){
    loader.load("assets/boat/ship_wreck.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(3, 3, 3)
      let angle = getRandomAngle()
      console.log(angle)
      let x = PlayerBoat.boat.position.x + 200*(Math.cos(angle))
      let z = PlayerBoat.boat.position.z + 200*(Math.sin(angle))
      gltf.scene.position.set(x,-1.5,z)
      this.boat = gltf.scene
      this.destroyed = 0
      this.initDirection = (PlayerBoat.boat.position.clone().add(this.boat.position.clone().multiplyScalar(-1))).multiplyScalar(0.005)
      // this.hasFired = 0
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  update(){
    if(this.boat && this.destroyed == 0){
      this.boat.lookAt(PlayerBoat.boat.position)
      this.boat.rotateY(Math.PI/2)
      this.boat.translateX(enemySpeed)
      let distance = Math.sqrt(Math.pow(this.boat.position.x - PlayerBoat.boat.position.x, 2) + Math.pow(this.boat.position.z - PlayerBoat.boat.position.z, 2))
    
      if(distance < 150 && time % 120 == 0){
        console.log(this.initDirection)
        let x = this.boat.position.x - PlayerBoat.boat.x
        let y = this.boat.position.y - PlayerBoat.boat.y
        let z = this.boat.position.z - PlayerBoat.boat.z

        const cannonball = new cannonBall(this.boat.position.x, this.boat.position.y, this.boat.position.z, (PlayerBoat.boat.position.clone().add(this.boat.position.clone().multiplyScalar(-1))).multiplyScalar(0.01))
        EnemyBallsList.push(cannonball)
        this.hasFired = 1
      }
    }
  }
}

// creating a treasure class
class Treasure{
  constructor(){
    loader.load("assets/treasure/treasure.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(7, 7, 7)
      this.treasure = gltf.scene
      this.collected = 0
      if(Math.random() > 1){
        this.treasure.position.set(random(-100, 100), -1, random(-100, 100))
      }else{
        this.treasure.position.set(random(-500, 500), -1, random(-1000, 1000))
      }
    })
  }
}

function cameraSetup() {
  camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 0, 35, 0 );
  camera.lookAt( 0,-1.5,-80 );
}

function waterSetup() {
  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      distortionScale: 3.7,
    }
  );
  water.rotation.x = - Math.PI / 2;
  scene.add(water);
}

function addTreasure() {
  for(let i = 0; i < 30; i++){
    const chest = new Treasure()
    treasureList.push(chest)
  }
}

const PlayerBoat = new Boat()

let enemyList = []
const enemy = new Enemy()
enemyList.push(enemy) 

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  cameraSetup();

  sun = new THREE.Vector3();

  waterSetup();

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  sun.setFromSphericalCoords( 5, Math.PI/2.1, Math.PI );

  sky.material.uniforms[ 'sunPosition' ].value.copy( sun );

  scene.environment = pmremGenerator.fromScene( sky ).texture;

  const waterUniforms = water.material.uniforms;

  addTreasure();

  window.addEventListener( 'resize', onWindowResize );

  window.addEventListener( 'keydown', function(e){
    if(e.key in keyPressed)
    {
      keyPressed[e.key].pressed = 1
    }
    if(e.key == "b")
    {
      viewBool = (viewBool + 1) % 2
      console.log(viewBool)
      if(viewBool)
      {
        camera.position.set(PlayerBoat.boat.position.x, PlayerBoat.boat.position.y + 300, PlayerBoat.boat.position.z)
        camera.lookAt(PlayerBoat.boat.position)
      }
      else
      {
        camera.position.x = PlayerBoat.boat.position.x + cameravector.x
        camera.position.y = PlayerBoat.boat.position.y + cameravector.y
        camera.position.z = PlayerBoat.boat.position.z + cameravector.z
        camera.lookAt(PlayerBoat.boat.position)
        console.log(camera.position)
        console.log(PlayerBoat.boat.position)
      }
    }
  })

  window.addEventListener( 'keyup', function(e){
    PlayerBoat.stop()
  })
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function isColliding(obj1, obj2){
  return (
    Math.abs(obj1.position.x - obj2.position.x) < 10 &&
    Math.abs(obj1.position.z - obj2.position.z) < 10
  )
}

function checkCollisions(){
  if(PlayerBoat.boat){
    treasureList.forEach(treasure => {
      if(treasure.treasure){
        if(isColliding(PlayerBoat.boat, treasure.treasure)){
          scene.remove(treasure.treasure)
          if(treasure.collected === 0)
          {
            score +=1
            treasure.collected = 1
          }
        }
      }
    })

    enemyList.forEach(enemy => {
      if(enemy.boat){
        if(isColliding(PlayerBoat.boat, enemy.boat)){
          scene.remove(enemy.boat)
          if(enemy.destroyed === 0)
          {
            health -= 25
            enemy.destroyed = 1
          }
        }
      }
    })

    PlayerBallsList.forEach(cannonBall => {
      if(cannonBall.ball)
      {
        enemyList.forEach(enemy => {
          if(isColliding(cannonBall.ball,enemy.boat))
          {
            if(enemy.destroyed === 0)
            {
              scene.remove(enemy.boat)
              score+=10
              enemy.destroyed = 1
            }
            if(cannonBall.destroyed === 0)
            {
              scene.remove(cannonBall.ball)
              cannonBall.destroyed = 1
            }
          }
        })
        
      }
    })

    EnemyBallsList.forEach(cannonBall => {
      if(cannonBall.ball)
      {
        if(isColliding(cannonBall.ball,PlayerBoat.boat))
        {
          if(cannonBall.destroyed === 0)
          {
            scene.remove(cannonBall.ball)
            health -= 10
            cannonBall.destroyed = 1
          }
        }
      }
    })
  }
}

function resetbools(){
  for(let key in keyPressed){
    keyPressed[key].pressed = 0
  }
}

function setbools(){
  for (let key in keyPressed) {
    if (keyPressed[key]["pressed"]) {
      keyPressed[key].f();
    }
  }
}

function updatehud(){
  time++;
  if(time % 60 == 0)
  {
    // console.log(time)
    //change inner html
    document.getElementById("time").innerHTML = "Time: " + time/60 + "s"
  }
  document.getElementById("health").innerHTML = "Health: " + health
  document.getElementById("score").innerHTML = "Score: " + score
}

function updateEnemies(){
  if((time % (1800)) == 0)
  {
    for(let i = 0; i < 2; i++)
    {
      const enemy = new Enemy()
      enemyList.push(enemy) 
    }
    enemySpeed -= 0.05
  }
  enemyList.forEach(enemy => {
    enemy.update();
  })
}

function updateBalls(){
  PlayerBallsList.forEach(ball => {
    ball.update();
  })
  EnemyBallsList.forEach(ball => {
    ball.update();
  })
}

function checkgameOver()
{
  if(health <= 0)
  {
    PlayerBoat.boat.isDead = 
    health = 0
    renderer.setAnimationLoop(null);
    document.getElementById("gameover").innerHTML = "GAME OVER"
    document.getElementById("gameover").style.display = "block"
  }
}

function animate() {
  requestAnimationFrame(animate);
  if(health > 0)
  {
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    renderer.render( scene, camera );
    checkCollisions();
    setbools();
    PlayerBoat.update();
    resetbools();
    updatehud();
    updateEnemies();
    updateBalls();
  }
  checkgameOver();
}

init();
animate();
