const popupContainer = document.getElementById('popup-container');
const button = document.createElement('button');
button.textContent = 'Open Options Page';
button.addEventListener('click', () => {
    // chrome.runtime.openOptionsPage(); // Unintended behavior in Firefox
    chrome.tabs.create({ url: chrome.runtime.getURL('html/options.html') });
});
popupContainer.appendChild(button);