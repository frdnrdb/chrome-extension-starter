import './popup.scss';
import { ext } from '../helpers';

// to be able to detect disconnect (aka popup closed) in background script
ext.connectPort('popup');

ext.onMessage((payload, sender, sendResponse) => {
	console.log('popup', payload, sender);
	if (payload.command === 'to-popup-from-background') {

			// hello popup from background
			document.body.innerHTML += '<h2>' + payload.message + '</h2>'; 

			// current tab info
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				document.body.innerHTML += '<pre>' + JSON.stringify(tabs, null, 2) + '</pre><br>';
		});
	}
});

ext.sendMessage({ command: 'popup-needs-something' });