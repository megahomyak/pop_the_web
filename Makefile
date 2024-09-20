releases: chrome.zip firefox.zip

chrome.zip: background.js manifest_v3.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	zip chrome.zip background.js manifest_v3.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	7z rn chrome.zip manifest_v3.json manifest.json

firefox.zip: background.js manifest_v2.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	zip firefox.zip background.js manifest_v2.json pin_128_128.png pin_128_128_crossed.png pop.mp3 content.js
	7z rn firefox.zip manifest_v2.json manifest.json
