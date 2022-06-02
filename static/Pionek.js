class Pionek extends THREE.Mesh {
  constructor(playerColor) {
    super();
    this._color = playerColor == 2 ? 0xaaaaaa : 0xa81313;
    this.isQueen = false;
    this.geometry = new THREE.CylinderGeometry(10, 10, 5, 32);
    this.material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // dwustronny
      map: playerColor == 2 ? new THREE.TextureLoader().load('./texture/sl.png') : new THREE.TextureLoader().load('./texture/sl2.png'),
      color: this._color,
      transparent: true, // przezroczysty / nie
      opacity: 1, // stopień przezroczystości
    });
  }

  set colorPawn(value) {
    console.log("setter");
    this.material.color.setHex(value);
  }

  setColor = (colorPlayer) => {
    this.material.color.setHex(colorPlayer == "white" ? 0xaaaaaa : 0xa81313);
  };

  checkPawnColor = (playerColor) => {
    if (playerColor == "white" && this.material.color.getHex() == 0xaaaaaa) {
      return true;
    } else if (
      playerColor == "black" &&
      this.material.color.getHex() == 0xa81313
    ) {
      return true;
    } else {
      return false;
    }
  };

  setQueen = () => {
    this.geometry.dispose();
    this.geometry = new THREE.CylinderGeometry(10, 5, 15, 32);
    this.isQueen = true;
  };
  isQueenF = () => {
    return this.isQueen;
  };
}

export default Pionek;
