/*
	extension helpers
*/
export const ext = (() => {
	const callbacks = [];

	chrome.runtime.onMessage.addListener(payload => {
		callbacks.forEach(fn => fn(payload));
	});

	return {
		onMessage: fn => callbacks.push(fn),
		sendMessage: payload => {
			try {
				chrome.runtime.sendMessage(payload);
			} catch (e) {
				/*
					hotreload extension
					• avoid uncaught runtime error as webpack rebuilds extension folder
				*/
				if (/doesn't match definition runtime\.connect/.test(e.message)) {
					location.reload();
				}
			}			
		},
		/*
			long lived extension connection
		*/
		connectPort: name => chrome.runtime.connect({
			name: name || 'chrome extension'
		})
	};
})();

/*
	async chrome.storage.sync wrapper
*/
export const storage = (() => {
	const p = (method, key) => new Promise(resolve => {
		if (!key) return chrome.storage.sync[method](resolve); // clear
		chrome.storage.sync[method](key, res => {
			resolve(typeof res === 'string' ? res : res && (res[key] || res));
		});
	});

	return {
		get: key => p('get', key), 
		set: data => p('set', data),
		remove: key => p('remove', key),
		clear: () => p('clear'),
		update: async (key, data) => {
			const stored = await p('get', key) || {};
			stored[key] = stored[key] || {};
			Object.keys(data).map(setkey => (stored[key][setkey] = data[setkey]));
			return p('set', { [key]: stored[key] });
		}		
	};
})();

/*
	manifest helpers
*/
export const manifest = (() => {
	const manifest = chrome.runtime.getManifest();
	const { content_scripts: [{ matches }] } = manifest;
	const patterns = matches.map(glob => new RegExp(glob.replace(/\*/g, '(\\.+)?')));
	return {
		matches(url = location.href) {
			return !!patterns.reduce((n, p) => n + Number(p.test(url)), 0);
		},
		resources() {
			return manifest.web_accessible_resources;
		},
		resource(filename) {
			return chrome.extension.getURL(filename);
		},
		get(key) {
			return manifest[key];
		}
	}
})();