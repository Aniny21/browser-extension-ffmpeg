const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("lib/ffmpeg-core.js"),
    log: true,
    mainName: 'main'
});

async function runFFmpeg(inputFileName, outputFileName, commandStr, file) {
    if (ffmpeg.isLoaded()) {
        await ffmpeg.exit();
    }

    await ffmpeg.load();

    const commandList = commandStr.split(' ');
    if (commandList.shift() !== 'ffmpeg') {
        alert('Please start with ffmpeg');
        return;
    }

    ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
    console.log(commandList);
    await ffmpeg.run(...commandList);
    const data = ffmpeg.FS('readFile', outputFileName);
    const blob = new Blob([data.buffer]);
    downloadFile(blob, outputFileName);
}

function downloadFile(blob, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}


// convert sample file //
// convert sample_video.avi to sample_video.mp4
async function convertWebmToMp4() {
    const inputFileName = 'sample_video.webm';
    const outputFileName = 'sample_video.mp4';
    const inputVideoUrl = chrome.runtime.getURL(`data/${inputFileName}`);

    const commandStr = `ffmpeg -i ${inputFileName} -c copy ${outputFileName}`;
    await runFFmpeg(inputFileName, outputFileName, commandStr, inputVideoUrl);
}

// convert sample_audio.wav to sample_audio.mp3
async function convertWavToMp3() {
    const inputFileName = 'sample_audio.wav';
    const outputFileName = 'sample_audio.mp3';
    const inputAudioUrl = chrome.runtime.getURL(`data/${inputFileName}`);

    const commandStr = `ffmpeg -i ${inputFileName} -vn -ac 2 -ar 44100 -ab 256k -acodec libmp3lame -f mp3 ${outputFileName}`;
    await runFFmpeg(inputFileName, outputFileName, commandStr, inputAudioUrl);
}

// append video element
const videoContainer = document.getElementById('video-container');
const videoUrl = chrome.runtime.getURL('data/sample_video.webm');
const videoUrlLink = document.getElementById('video-url-link');
videoUrlLink.href = videoUrl;
const video = document.createElement('video');
video.controls = true;
video.classList.add('video');
video.src = videoUrl;
videoContainer.appendChild(video);

// append audio element
const audioContainer = document.getElementById('audio-container');
const audioUrl = chrome.runtime.getURL('data/sample_audio.wav');
const audioUrlLink = document.getElementById('audio-url-link');
audioUrlLink.href = audioUrl;
const audio = document.createElement('audio');
audio.controls = true;
audio.classList.add('audio');
audio.src = audioUrl;
audioContainer.appendChild(audio);

const convertVideo = document.getElementById('convert-video');
convertVideo.addEventListener('click', async () => {
    await convertWebmToMp4();
});

const convertAudio = document.getElementById('convert-audio');
convertAudio.addEventListener('click', async () => {
    await convertWavToMp3();
});


// convert custom file //
const run = document.getElementById('run');
run.addEventListener('click', async () => {
    const file = document.getElementById('file-input').files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }
    const commandInput = document.getElementById('command-input');
    const command = commandInput.value;
    const inputFileName = file.name;
    const outputFileName = command.split(' ').pop();

    await runFFmpeg(inputFileName, outputFileName, command, file);
});
