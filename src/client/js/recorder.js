
import { createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail : "thumbnail.jpg",
};

const downloadFile = (filUrl, fileName) => {

  const a = document.createElement("a");
  a.href = filUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
}

const handleDownload = async () => {

  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Trascording.....";

  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumbnail);

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumbnail);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg"});

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "recording.mp4");

  downloadFile(thumbUrl, files.thumbnail);

  ffmpeg.FS("unlink",files.input);
  ffmpeg.FS("unlink",files.output);
  ffmpeg.FS("unlink",files.thumbnail);

  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener = ("click", handleStart);
}

const handleStop = (e) => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
}

const handleStart = (e) => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    console.log(e);
    video.srcObject = null;
    video.src = videoFile
    video.loop = true;
    video.play();
  };
  recorder.start();
}

const init = async (e) => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  })
  video.srcObject = stream;
  video.play();
}

init();

actionBtn.addEventListener("click", handleStart); 