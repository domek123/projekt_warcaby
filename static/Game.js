import Pionek from "./Pionek.js";
import Item from "./Item.js";

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.axes = new THREE.AxesHelper(1000, 1000, 1000);
    this.scene.add(this.axes)
    this.colorPlayer = "white";
    this.pionki = [
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ];
    this.PionList = [];
    this.ItemList = [];
    this.yourPawn = 8;
    this.oponentPawn = 8;

    this.isPlay = false;
    this.toKill = {};

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xFFFFFF);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root").append(this.renderer.domElement);

    this.camera.position.set(0, 120, 140);
    this.camera.lookAt(this.scene.position);

    this.renderCrossPlay();
    this.net = null;
    this.ui = null;

    this.clickedObj = null;
    this.helperArray1 = [-70, -50, -30, -10, 10, 30, 50, 70];

    this.render(); // wywołanie metody render

    this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
    this.mouseVector = new THREE.Vector2(); // ten wektor czyli pozycja w

    window.addEventListener("mousedown", (event) => {
      if (this.isPlay) {
        this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        this.intersects = this.raycaster.intersectObjects(this.scene.children);
        this.helperArray = [-70, -50, -30, -10, 10, 30, 50, 70];
        if (this.intersects.length > 0) {
          if (
            this.intersects[0].object.geometry.type == "CylinderGeometry" &&
            this.intersects[0].object.checkPawnColor(this.colorPlayer)
          ) {
            if (this.clickedObj != null) {
              if (this.colorPlayer == "white") {
                this.clickedObj.colorPawn = 0xaaaaaa;
              } else {
                this.clickedObj.colorPawn = 0xa81313;
              }
              this.ItemList.forEach((item) => {
                if (item.material.color.getHex() == 0xffff00) {
                  item.material.color.setHex(0x333333);
                }
              });
            }
            this.clickedObj = this.intersects[0].object;

            if (!this.clickedObj.isQueenF()) {
              this.setPositionToMove(
                this.colorPlayer,
                this.clickedObj,
                this.helperArray
              );
            } else {
              this.setQueenPos();
            }

            console.log(this.clickedObj.material.color.getHex());
            this.clickedObj.colorPawn = 0xffff00;
          } else if (
            this.clickedObj != null &&
            this.intersects[0].object.geometry.type == "BoxGeometry"
          ) {
            if (this.intersects[0].object.material.color.getHex() == 0xffff00) {
              this.ItemList.forEach((item) => {
                if (item.material.color.getHex() == 0xffff00) {
                  item.material.color.setHex(0x333333);
                }
              });
              this.startPos = {
                x: this.helperArray.indexOf(this.clickedObj.position.x),
                z: this.helperArray.indexOf(this.clickedObj.position.z),
              };
              new TWEEN.Tween(this.clickedObj.position)
                .to(
                  {
                    x: this.intersects[0].object.position.x,
                    z: this.intersects[0].object.position.z,
                  },
                  500
                )
                .repeat(0)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(() => {
                  console.log(this.clickedObj.position);
                })
                .onComplete(() => {
                  this.clickedObj.setColor(this.colorPlayer);
                  this.endPos = {
                    x: this.helperArray.indexOf(this.clickedObj.position.x),
                    z: this.helperArray.indexOf(this.clickedObj.position.z),
                  };
                  this.itemToRemove = this.checkIfKill(this.endPos);
                  console.log(this.itemToRemove);
                  this.checkIfQueen(this.clickedObj);
                  this.clickedObj = null;
                  if (this.itemToRemove != null) {
                    this.oponentPawn -= 1;
                  }

                  this.net.changePosition(
                    this.startPos,
                    this.endPos,
                    this.itemToRemove
                  );
                  this.isPlay = false;
                  this.ui.StopTimer();
                })
                .start();
            }
          }
        }
      }
    });

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  updatePions = (currentTab) => {
    this.pionki = currentTab;
    if (this.oponentPawn == 0) {
      this.ui.WinScreen();
    } else {
      this.net.waitingTo(this.pionki);
    }
  };

  render = () => {
    TWEEN.update();
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    console.log("render leci");
  };

  renderPlayers = () => {
    this.helperArray = [-70, -50, -30, -10, 10, 30, 50, 70];

    for (let i = 0; i < this.pionki.length; i++) {
      for (let j = 0; j < this.pionki[i].length; j++) {
        if (this.pionki[i][j] == 0) {
          continue;
        }

        this.pionek = new Pionek(this.pionki[i][j]);

        this.x = this.helperArray[j];
        this.z = this.helperArray[i];

        this.pionek.position.set(this.x, 3, this.z);
        this.PionList.push(this.pionek);
        this.scene.add(this.pionek);
      }
    }
  };

  renderCrossPlay = () => {
    this.szachownica = [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ];

    this.helperArray = [-70, -50, -30, -10, 10, 30, 50, 70];

    this.playingTab = [];
    for (let i = 0; i < this.szachownica.length; i++) {
      for (let j = 0; j < this.szachownica[i].length; j++) {
        this.cube = new Item(this.szachownica[i][j]);

        this.x = this.helperArray[j];
        this.z = this.helperArray[i];
        this.cube.position.set(this.x, 0, this.z);
        this.scene.add(this.cube);
        this.ItemList.push(this.cube);
      }
    }
  };

  addPlayerToGame = (number) => {
    this.renderPlayers();
    if (number == 1) {
      this.camera.position.set(0, 120, -140);
      this.camera.lookAt(this.scene.position);
      this.ui.StartTimer();
      this.colorPlayer = "white";
    } else {
      this.colorPlayer = "black";
      this.net.firstTry();
    }
  };

  getNet = (netObj) => {
    this.net = netObj;
  };

  getUpdatedData = (currentTab, posToRem) => {
    this.isPlay = false;
    this.itemekToRem =
      posToRem == null
        ? { x: -1000, z: 1000 }
        : { x: posToRem.x, z: posToRem.z };

    this.ui.StartTimer();
    console.table(this.pionki);
    console.table(currentTab);
    //debugger;
    this.startPos = { x: 0, z: 0 };
    this.endPos = { x: 0, z: 0 };
    for (let i = 0; i < this.pionki.length; i++) {
      for (let j = 0; j < this.pionki[i].length; j++) {
        if (this.itemekToRem.x == j && i == this.itemekToRem.z) {
          this.positionOfItem = {
            x: this.helperArray[j],
            z: this.helperArray[i],
          };
          this.PionList.forEach((item, index) => {
            if (
              item.position.z == this.positionOfItem.z &&
              item.position.x == this.positionOfItem.x
            ) {
              this.scene.remove(this.PionList[index]);
              this.PionList.splice(index, 1);
              this.yourPawn -= 1;
            }
          });
        } else if (
          currentTab[i][j] != this.pionki[i][j] &&
          currentTab[i][j] == 0
        ) {
          this.startPos = { x: this.helperArray[j], z: this.helperArray[i] };
        } else if (
          currentTab[i][j] != this.pionki[i][j] &&
          currentTab[i][j] != 0
        ) {
          this.endPos = { x: this.helperArray[j], z: this.helperArray[i] };
        }
      }
    }
    this.PionList.forEach((item) => {
      if (
        item.position.x == this.startPos.x &&
        item.position.z == this.startPos.z
      ) {
        new TWEEN.Tween(item.position)
          .to(
            {
              x: this.endPos.x,
              z: this.endPos.z,
            },
            500
          )
          .repeat(0)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .onUpdate(() => { })
          .onComplete(() => {
            this.isPlay = true;
            this.checkIfQueen(item);
            if (this.yourPawn == 0) {
              this.ui.LoseScreen();
            }
          })
          .start();
      }
    });

    this.pionki = currentTab;
    //this.isPlay = true;
  };
  start = () => {
    this.isPlay = true;
  };

  isBlack = () => {
    if (this.colorPlayer == "black") {
      return true;
    } else {
      return false;
    }
  };
  getUi = (uiObj) => {
    this.ui = uiObj;
  };

  setPositionToMove = (colorPlayer, clickedObj, helperArray) => {
    this.positionToMove = [
      {
        z:
          this.colorPlayer == "white"
            ? this.helperArray[
            this.helperArray.indexOf(this.clickedObj.position.z) + 1
            ]
            : this.helperArray[
            this.helperArray.indexOf(this.clickedObj.position.z) - 1
            ],
        x: this.helperArray[
          this.helperArray.indexOf(this.clickedObj.position.x) + 1
        ],
      },
      {
        z:
          this.colorPlayer == "white"
            ? this.helperArray[
            this.helperArray.indexOf(this.clickedObj.position.z) + 1
            ]
            : this.helperArray[
            this.helperArray.indexOf(this.clickedObj.position.z) - 1
            ],
        x: this.helperArray[
          this.helperArray.indexOf(this.clickedObj.position.x) - 1
        ],
      },
    ];
    this.PionList.forEach((item) => {
      if (
        item.position.x == this.positionToMove[0].x &&
        item.position.z == this.positionToMove[0].z
      ) {
        if (
          (colorPlayer == "white" &&
            item.material.color.getHex() == 0xaaaaaa) ||
          (colorPlayer == "black" && item.material.color.getHex() == 0xa81313)
        ) {
          this.positionToMove[0].x = null;
        } else if (
          (colorPlayer == "white" &&
            item.material.color.getHex() == 0xa81313) ||
          (colorPlayer == "black" && item.material.color.getHex() == 0xaaaaaa)
        ) {
          this.colorPlayer == "white"
            ? (this.positionToMove[0].z += 20)
            : (this.positionToMove[0].z -= 20);
          this.positionToMove[0].x += 20;
          this.toKill["first"] = {
            killed: {
              x: this.positionToMove[0].x - 20,
              z:
                this.colorPlayer == "white"
                  ? this.positionToMove[0].z - 20
                  : this.positionToMove[0].z + 20,
            },
            killing: {
              x: this.positionToMove[0].x,
              z:
                this.colorPlayer == "white"
                  ? this.positionToMove[0].z
                  : this.positionToMove[0].z,
            },
          };
          this.PionList.forEach((elem) => {
            if (
              elem.position.z == this.positionToMove[0].z &&
              elem.position.x == this.positionToMove[0].x
            ) {
              this.positionToMove[0].x = null;
            }
          });
        }
      }
      if (
        item.position.x == this.positionToMove[1].x &&
        item.position.z == this.positionToMove[1].z
      ) {
        if (
          (colorPlayer == "white" &&
            item.material.color.getHex() == 0xaaaaaa) ||
          (colorPlayer == "black" && item.material.color.getHex() == 0xa81313)
        ) {
          this.positionToMove[1].x = null;
        } else if (
          (colorPlayer == "white" &&
            item.material.color.getHex() == 0xa81313) ||
          (colorPlayer == "black" && item.material.color.getHex() == 0xaaaaaa)
        ) {
          this.colorPlayer == "white"
            ? (this.positionToMove[1].z += 20)
            : (this.positionToMove[1].z -= 20);
          this.positionToMove[1].x -= 20;
          this.toKill["second"] = {
            killed: {
              x: this.positionToMove[1].x + 20,
              z:
                this.colorPlayer == "white"
                  ? this.positionToMove[1].z - 20
                  : this.positionToMove[1].z + 20,
            },
            killing: {
              x: this.positionToMove[1].x,
              z:
                this.colorPlayer == "white"
                  ? this.positionToMove[1].z
                  : this.positionToMove[1].z,
            },
          };
          this.PionList.forEach((elem) => {
            if (
              elem.position.z == this.positionToMove[1].z &&
              elem.position.x == this.positionToMove[1].x
            ) {
              this.positionToMove[1].x = null;
            }
          });
        }
      }
    });
    console.log(this.toKill);

    this.ItemList.forEach((item) => {
      if (
        (item.position.x == this.positionToMove[0].x &&
          item.position.z == this.positionToMove[0].z) ||
        (item.position.x == this.positionToMove[1].x &&
          item.position.z == this.positionToMove[1].z)
      ) {
        item.material.color.setHex(0xffff00);
      }
    });
  };
  checkIfKill = (pos) => {
    console.log(pos, this.toKill);
    let toReturn = null;
    if (this.toKill.first != null) {
      if (
        this.helperArray1[pos.x] == this.toKill.first.killing.x &&
        this.helperArray1[pos.z] == this.toKill.first.killing.z
      ) {
        this.PionList.forEach((item, index) => {
          if (
            item.position.x == this.toKill.first.killed.x &&
            item.position.z == this.toKill.first.killed.z
          ) {
            let itemekToRem = {
              z: this.helperArray1.indexOf(item.position.z),
              x: this.helperArray1.indexOf(item.position.x),
            };
            this.scene.remove(this.PionList[index]);
            this.PionList.splice(index, 1);

            toReturn = itemekToRem;
          }
        });
      }
    }
    if (this.toKill.second != null) {
      if (
        this.helperArray1[pos.x] == this.toKill.second.killing.x &&
        this.helperArray1[pos.z] == this.toKill.second.killing.z
      ) {
        this.PionList.forEach((item, index) => {
          if (
            item.position.x == this.toKill.second.killed.x &&
            item.position.z == this.toKill.second.killed.z
          ) {
            let itemekToRem = {
              z: this.helperArray1.indexOf(item.position.z),
              x: this.helperArray1.indexOf(item.position.x),
            };
            this.scene.remove(this.PionList[index]);
            this.PionList.splice(index, 1);

            toReturn = itemekToRem;
          }
        });
      }
    }
    if (this.toKill.third != null) {
      if (
        this.helperArray1[pos.x] == this.toKill.third.killing.x &&
        this.helperArray1[pos.z] == this.toKill.third.killing.z
      ) {
        this.PionList.forEach((item, index) => {
          if (
            item.position.x == this.toKill.third.killed.x &&
            item.position.z == this.toKill.third.killed.z
          ) {
            let itemekToRem = {
              z: this.helperArray1.indexOf(item.position.z),
              x: this.helperArray1.indexOf(item.position.x),
            };
            this.scene.remove(this.PionList[index]);
            this.PionList.splice(index, 1);

            toReturn = itemekToRem;
          }
        });
      }
    }
    if (this.toKill.fourth != null) {
      if (
        this.helperArray1[pos.x] == this.toKill.fourth.killing.x &&
        this.helperArray1[pos.z] == this.toKill.fourth.killing.z
      ) {
        this.PionList.forEach((item, index) => {
          if (
            item.position.x == this.toKill.fourth.killed.x &&
            item.position.z == this.toKill.fourth.killed.z
          ) {
            let itemekToRem = {
              z: this.helperArray1.indexOf(item.position.z),
              x: this.helperArray1.indexOf(item.position.x),
            };
            this.scene.remove(this.PionList[index]);
            this.PionList.splice(index, 1);

            toReturn = itemekToRem;
          }
        });
      }
    }
    this.toKill = {};
    return toReturn;
  };
  checkIfQueen = (clickedObj) => {
    if (clickedObj.position.z == 70 || clickedObj.position.z == -70) {
      clickedObj.setQueen();
    }
  };

  setQueenPos = () => {
    this.z1 = this.clickedObj.position.z;
    this.x1 = this.clickedObj.position.x;
    let x = this.x1;
    this.positionsToMove = [];

    for (let z = this.z1 + 20; z <= 70; z = z + 20) {
      x = x + 20;
      let isPotential = false;
      let isPawn = false;
      let colorOf;

      this.PionList.forEach((item) => {
        if (item.position.z == z + 20 && item.position.x == x + 20) {
          isPotential = true;
        }
        if (item.position.z == z && item.position.x == x) {
          isPawn = true;
          colorOf = item.material.color.getHex();
        }
      });
      if (!isPawn) {
        this.positionsToMove.push({ x, z });
      } else if (isPawn && !isPotential) {
        if (
          (this.colorPlayer == "white" && colorOf == 0xaaaaaa) ||
          (this.colorPlayer == "black" && colorOf == 0xa81313)
        ) {
          break;
        }
        this.positionsToMove.push({ x: x + 20, z: z + 20 });
        this.toKill["first"] = {
          killed: {
            x,
            z,
          },
          killing: {
            x: x + 20,
            z: z + 20,
          },
        };
        break;
      } else {
        break;
      }
    }

    x = this.x1;
    for (let z = this.z1 + 20; z <= 70; z = z + 20) {
      x = x - 20;
      let isPotential = false;
      let isPawn = false;
      let colorOf;

      this.PionList.forEach((item) => {
        if (item.position.z == z + 20 && item.position.x == x - 20) {
          isPotential = true;
        }
        if (item.position.z == z && item.position.x == x) {
          isPawn = true;
          colorOf = item.material.color.getHex();
        }
      });
      if (!isPawn) {
        this.positionsToMove.push({ x, z });
      } else if (isPawn && !isPotential) {
        if (
          (this.colorPlayer == "white" && colorOf == 0xaaaaaa) ||
          (this.colorPlayer == "black" && colorOf == 0xa81313)
        ) {
          break;
        }
        this.positionsToMove.push({ x: x - 20, z: z + 20 });
        this.toKill["second"] = {
          killed: {
            x,
            z,
          },
          killing: { x: x - 20, z: z + 20 },
        };
        break;
      } else {
        break;
      }
    }

    x = this.x1;
    for (let z = this.z1 - 20; z >= -70; z = z - 20) {
      x = x - 20;
      let isPotential = false;
      let isPawn = false;
      let colorOf;

      this.PionList.forEach((item) => {
        if (item.position.z == z - 20 && item.position.x == x - 20) {
          isPotential = true;
        }
        if (item.position.z == z && item.position.x == x) {
          isPawn = true;
          colorOf = item.material.color.getHex();
        }
      });
      if (!isPawn) {
        this.positionsToMove.push({ x, z });
      } else if (isPawn && !isPotential) {
        if (
          (this.colorPlayer == "white" && colorOf == 0xaaaaaa) ||
          (this.colorPlayer == "black" && colorOf == 0xa81313)
        ) {
          break;
        }
        this.positionsToMove.push({ x: x - 20, z: z - 20 });
        this.toKill["third"] = {
          killed: {
            x,
            z,
          },
          killing: { x: x - 20, z: z - 20 },
        };
        break;
      } else {
        break;
      }
    }

    x = this.x1;
    for (let z = this.z1 - 20; z >= -70; z = z - 20) {
      x = x + 20;
      let isPotential = false;
      let isPawn = false;
      let colorOf;

      this.PionList.forEach((item) => {
        if (item.position.z == z - 20 && item.position.x == x + 20) {
          isPotential = true;
        }
        if (item.position.z == z && item.position.x == x) {
          isPawn = true;

          colorOf = item.material.color.getHex();
        }
      });
      if (!isPawn) {
        this.positionsToMove.push({ x, z });
      } else if (isPawn && !isPotential) {
        if (
          (this.colorPlayer == "white" && colorOf == 0xaaaaaa) ||
          (this.colorPlayer == "black" && colorOf == 0xa81313)
        ) {
          break;
        }
        this.positionsToMove.push({ x: x + 20, z: z - 20 });
        this.toKill["fourth"] = {
          killed: {
            x,
            z,
          },
          killing: { x: x + 20, z: z - 20 },
        };
        break;
      } else {
        break;
      }
    }

    this.ItemList.forEach((item) => {
      this.positionsToMove.forEach((element) => {
        if (item.position.x == element.x && item.position.z == element.z) {
          item.material.color.setHex(0xffff00);
        }
      });
    });
  };
}

export default Game;

