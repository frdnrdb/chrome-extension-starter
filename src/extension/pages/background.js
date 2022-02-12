import { manifest } from '../helpers';

const session = {
	id: chrome.runtime.id,
	tab: false
};

const onMessage = (payload, sender, sendResponse) => {

	if (payload.command === 'hello-from-content-script') {
		setIcon(true);
		session.tab = session.tab || sender.tab.id;

		chrome.tabs.sendMessage(session.tab, {
			command: 'init',
			data: 'hello back to you content script'
		});
	}

	if (payload.command === 'popup-needs-something') {
		chrome.runtime.sendMessage({
			command: 'to-popup-from-background',
			message: 'hello popup from background'
		});
	}

};

const onConnect = port => {
	port.onDisconnect.addListener(function (disconnectedPort) {
		if (disconnectedPort.name === 'popup') {
			// if (session.settingsChanged) chrome.tabs.reload(session.tab);
		}
	});

	if (port.name === 'popup') return;

	port.onMessage.addListener((payload, port) => {
		if (!port) return;
		if (payload.command === 'something') {
			// do something
		}
	});
};

const onRemoved = tab => {
	if (tab = session.tab) delete session.tab;
};

const onCreated = tab => {
	if (tab.openerTabId === session.tab) {
	/*
		// set focus back to main tab if main tab opens another tab ... ;-)
		chrome.tabs.update(session.tab, {
			active: true,
			selected: true
		});
	*/
	}
};

const onActivated = activeInfo => {
	setIcon(activeInfo.tabId === session.tab);
};

const onUpdated = (tabId, changeInfo, tab) => {
	if (tabId === session.tab && (changeInfo.status === 'complete')) {
		// ...
	}
};

chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onConnect.addListener(onConnect);
chrome.tabs.onRemoved.addListener(onRemoved);
chrome.tabs.onCreated.addListener(onCreated);
chrome.tabs.onActivated.addListener(onActivated);
chrome.tabs.onUpdated.addListener(onUpdated);

function setIcon(on) {
	chrome.browserAction.setIcon({ path: on ? '/icon.png' : '/icon-disabled.png' });
	chrome.browserAction[on ? 'enable' : 'disable']();
}

/*
	reload tab and extension on (re)activation
*/
(function reloadOnRestart() {
	chrome.runtime.onInstalled.addListener(reloadOnRestart);
	chrome.tabs.query({}, tabs => {
		tabs.map(tab => {
			if (manifest.matches(tab.url)) {
				chrome.tabs.reload(tab.id);
			}
		});
	});
})();