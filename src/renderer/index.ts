import { ipcRenderer } from 'electron';

if (typeof window !== 'undefined' && window.location) {
	let query = new URLSearchParams(window.location.search);
  if (query.get('overlay') === 'hidden') import('./App');
  else import('./Overlay');
}

ipcRenderer.send('start');