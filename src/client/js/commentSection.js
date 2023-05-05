const { async } = require("regenerator-runtime");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, newCommentId) => {
  const videoComment = document.querySelector(".video__comment ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment--text";
  newComment.dataset.id = newCommentId;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const spanX = document.createElement("span");
  spanX.innerText = "❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(spanX);
  videoComment.prepend(newComment);
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.videoid;

  if (text === "") {
    return;
  }
  //fetch는 url 변경 없이 js 로 req를 보내게 해준다.
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    const { newCommentId } = await response.json();
    textarea.value = "";
    addComment(text, newCommentId);
  }
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}

