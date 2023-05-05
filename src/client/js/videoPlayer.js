const video = document.querySelector("video")

const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");

const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreenBtn");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const time = document.getElementById("time");

let controlsTiemeOut = null;
let controlsMovementTimeOut = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (e) => {
  const { target: { value } } = e;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
  if (volumeValue == 0) {
    muteBtnIcon.classList = "fas fa-volume-mute";
  } else {
    muteBtnIcon.classList = "fas fa-volume-up";
  }
};

const formatTime = (seconds) => new Date(seconds * 1000).
  toISOString().
  substr(14, 5);

const handleLoadedMetadata = (e) => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = (e) => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (e) => {
  const { target: { value },
  } = e;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  console.log(document.fullscreenElement);

  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtnIcon.classList = "fas fa-expand";

  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = (e) => {
  if (controlsTiemeOut) {
    clearTimeout(controlsTiemeOut);
    controlsTiemeOut = null;
  }

  if (controlsMovementTimeOut) {
    clearTimeout(controlsMovementTimeOut);
    controlsMovementTimeOut = null;
  }

  videoControls.classList.add("showing")
  controlsMovementTimeOut = setTimeout(hideControls, 5000);
};

const handleMouseLeave = () => {
  controlsTiemeOut = setTimeout(hideControls, 5000)
};

// 조회수는 랜더링을 하지 않음.
const handleEnded = (e) => {
  const { videoid } = videoContainer.dataset;
  fetch(`/api/videos/${videoid}/view`,{
    method: "POST",
  });
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);

volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimelineChange);

fullScreenBtn.addEventListener("click", handleFullScreen);
