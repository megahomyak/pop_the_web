releases: chrome.zip firefox.zip

chrome.zip: background.js manifest_chrome.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	zip - background.js manifest_chrome.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js > chrome.zip
	7z rn chrome.zip manifest_chrome.json manifest.json

firefox.zip: background.js manifest_firefox.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	zip - background.js manifest_firefox.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js > firefox.zip
	7z rn firefox.zip manifest_firefox.json manifest.json
