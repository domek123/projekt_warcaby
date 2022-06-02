class Item extends THREE.Mesh {
  constructor(playerPos) {
    super();
    this.geometry = new THREE.BoxGeometry(20, 1, 20);
    this.material = new THREE.MeshBasicMaterial({
      color: playerPos == 1 ? 0x333333 : 0xffffff,
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("texture/black.jpg"),

      transparent: true,
      opacity: 1,
    });
  }
}

export default Item;
