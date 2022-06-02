import Game from "./Game.js";
import Ui from "./Ui.js";
import Net from "./Net.js";

let game;
let net;
let ui;
window.onload = () => {
  game = new Game();
  net = new Net();
  ui = new Ui();

  ui.getNet(net);
  ui.getGame(game);
  net.getUi(ui);
  net.getGame(game);
  game.getNet(net);
  game.getUi(ui);
};
