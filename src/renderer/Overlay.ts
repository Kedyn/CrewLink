import './css/overlay.css';
// @ts-ignore
import speaker from '../../static/speaker.png';
import { ipcRenderer } from 'electron';
import { AmongUsState, GameState } from '../main/GameReader';

const playerColors = [
	'#C51111',
	'#132ED1',
	'#117F2D',
	'#ED54BA',
	'#EF7D0D',
	'#F5F557',
	'#3F474E',
	'#D6E0F0',
	'#6B2FBB',
	'#71491E',
	'#38FEDC',
	'#50EF39'
];

const speakerImage = new Image;
const canvas = document.createElement("canvas");

speakerImage.src = speaker;

canvas.width = 800;
canvas.height = 600;

document.getElementById('app')!.appendChild(canvas);

const context = canvas.getContext('2d');

/* speakerImage.onload = () => {
  context!.drawImage(speakerImage, 400, 300);
  context!.globalCompositeOperation = 'source-in';
  context!.fillStyle = 'red';
  context!.fillRect(400,300,25,25);
  //context!.clearRect(0,0,800,600);
  context!.restore();
}; */

const hexToRGB = (hex: string): number[] => {
  const pairs = hex.substr(1).match(/.{1,2}/g);

  return [
    parseInt(pairs![0], 16),
    parseInt(pairs![1], 16),
    parseInt(pairs![2], 16)
  ];
};

ipcRenderer.on('gameState', (_: Electron.IpcRendererEvent, newState: AmongUsState) => {
  context!.clearRect(0, 0, 800, 600);
  //context!.globalCompositeOperation = 'source-in';

  if (newState.gameState === GameState.LOBBY) {

    newState.players.forEach(player => {
      const x = player.x * 7.5 + 400;
      const y = player.y * -6 + 240;

      context!.drawImage(speakerImage, x, y);
      
      const imgData = context!.getImageData(x, y, 25, 25);
      
      const color = hexToRGB(playerColors[player.colorId]);

      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = color[0];
        imgData.data[i + 1] = color[1];
        imgData.data[i + 2] = color[2];
      }
      
      context!.putImageData(imgData, x, y);
    });

    context!.restore();
  }
});