/*
  webpack --watch in combination with webpack config CopyWebpackPlugin
    • create a reloader[hash] file at each build
    • check periodically if file name (hash) changes
    • name change + cms tab is open = reload extension + reload cms tab
*/

import { manifest } from '../helpers';

const interval = 2000;
let check;

chrome.runtime.getPackageDirectoryEntry(dir => {
  setInterval(() => {
    dir.createReader().readEntries(entries => {
      const hashedFile = entries.find(o => /^reloader/.test(o.name)) || {};
      if (check && hashedFile.name !== check) return reload();
      check = hashedFile.name;
    });
  }, interval);
});

function reload() {
  chrome.tabs.query({}, tabs => {
    tabs.map(tab => {
      if (manifest.matches(tab.url)) {
        chrome.tabs.reload(tab.id);
        chrome.runtime.reload();
      }
    });
  });
}
