class Net {
  constructor() {
    this.ui = null;
    this.game = null;
  }

  login = (userName) => {
    console.log(userName);
    const headers = { "Content-Type": "application/json" };
    fetch("/login", {
      method: "post",
      body: JSON.stringify({ login: userName }),
      headers,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isFull) {
          this.ui.cantGo();
        } else {
          this.ui.addPlayer(data);
          this.waiting();
        }
      });
  };

  reset = () => {
    fetch("/reset")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  };

  setLose = () => {
    fetch("/setLose")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  };

  chechIfLose = () => {
    this.lostInterval = setInterval(() => {
      fetch("/checkIsLose")
        .then((response) => response.json())
        .then((data) => {
          console.log("checking");
          if (data.isLost) {
            this.ui.LoseScreen();
            clearInterval(this.lostInterval);
          }
        });
    }, 500);
  };

  waiting = () => {
    this.interval = setInterval(() => {
      fetch("/waiting")
        .then((response) => response.json())
        .then((data) => {
          if (data.len == 1 || data.len == 0) {
            this.ui.isLogged(false);
          } else {
            this.ui.isLogged(true);
            clearInterval(this.interval);
            if (this.game.isBlack()) {
              this.ui.TimerStart();
            } else {
              this.game.start();
              this.chechIfLose();
              this.ui.updatePlayer(data);
            }
          }
        });
    }, 500);
  };

  changePosition = (startPos, endPos, itemToRemove) => {
    const body = JSON.stringify({ startPos, endPos, itemToRemove });
    const headers = { "Content-Type": "application/json" };
    fetch("/updateTab", { method: "post", body, headers })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.game.updatePions(data.currentTab);
      });
  };

  waitingTo = (pionki) => {
    clearInterval(this.lostInterval);
    this.ui.TimerStart();
    this.interval = setInterval(() => {
      const body = JSON.stringify({ pionki });
      const headers = { "Content-Type": "application/json" };
      fetch("/isEquals", { method: "post", body, headers })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.info);
          if (data.info == "not equal") {
            clearInterval(this.interval);
            this.ui.TimerStop();
            console.log("AAAAAAAAAAAAAAAAAAAAAAA");
            this.game.getUpdatedData(data.currentTab, data.posToRem);
            this.chechIfLose();
          }
        });
    }, 1000);
  };

  firstTry = () => {
    //this.ui.TimerStart();
    this.interval1 = setInterval(() => {
      fetch("/firstTry")
        .then((response) => response.json())
        .then((data) => {
          if (data.isInteraction) {
            clearInterval(this.interval1);
            this.chechIfLose();
            this.game.getUpdatedData(data.currentTab);
            this.ui.TimerStop();
          }
        });
    }, 1000);
  };

  getUi = (uiObj) => {
    this.ui = uiObj;
  };

  getGame = (gameObj) => {
    this.game = gameObj;
  };
}

export default Net;
