const APP_ID = "99bdb42c8ffc4db8908c4e61105c159a";

let uid = localStorage.getItem("uid");

if (!uid) {
  window.location = "/login";
}

// let uid = sessionStorage.getItem('uid')
// if(!uid){
//     uid = String(Math.floor(Math.random() * 10000))
//     sessionStorage.setItem('uid', uid)
// }

const idusmt = String(Math.floor(Math.random() * 1000000000000));
let idsgbg = String(Math.floor(Math.random() * 1000000000000));
let idimg = Math.floor(Math.random() * 5) + 1;
let imgURL = null;
let rateNum = 5;
const rateMap = new Map([
  [1, "star1"],
  [2, "star2"],
  [3, "star3"],
  [4, "star4"],
  [5, "star5"],
]);

let token = null;
let client;
let processor;
let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

let displayName = localStorage.getItem("display_name");
if (!displayName) {
  window.location = "/login";
}

//rôm.html?rôm = 234

if (!roomId) {
  roomId = "main";
}

let localTracks = [];

let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;
let setBg = false;
let checkIsCloseForm = true;

let joinRoomInit = async () => {
  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ uid, token });

  await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName });

  channel = await rtmClient.createChannel(roomId);
  await channel.join();

  ///message feature
  channel.on("MemberJoined", handleMemberJoined);
  channel.on("MemberLeft", handleMemberLeft);
  channel.on("ChannelMessage", handleChannelMessage);

  getMembers();

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  await client.join(APP_ID, roomId, token, uid);
  client.on("user-published", handleUserPublisher);
  client.on("user-left", handleUserLeft);

  joinStream();

  const members = await channel.getMembers();
  let size = members.length;
  if (size == 1 && checkIsCloseForm) {
    document.getElementById("surveyForm").style.display = "flex";
  } else {
    try {
      const response = await fetch(
        "http://localhost:3333/meeting/create-user-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            code: roomId,
            id: idusmt,
            username: uid,
            starttime: new Date(),
          }),
        }
      );
      const data = await response.json();
    } catch (e) {
      console.log("error", e);
    }
  }
};

let joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video__container" id = "user-container-${uid}">
                    <div class="video-player" id ="user-${uid}"></div>
               </div>`;
  document
    .getElementById("streams__container")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${uid}`);

  document
    .getElementById(`user-container-${uid}`)
    .addEventListener("click", expandVideoFrame);

  const extension = new VirtualBackgroundExtension();

  if (!extension.checkCompatibility()) {
    console.error("Does not support Virtual Background!");
    // Handle exit code
  }
  // Register the extension
  AgoraRTC.registerExtensions([extension]);

  processor = extension.createProcessor();
  ///
  await processor.init("./assets/wasms");

  localTracks[1].pipe(processor).pipe(localTracks[1].processorDestination);

  await client.publish([localTracks[0], localTracks[1]]);
};

let switchToCamera = async () => {
  let player = `<div class="video__container" id = "user-container-${uid}">
                    <div class="video-player" id ="user-${uid}"></div>
               </div>`;
  displayFrame.insertAdjacentHTML("beforeend", player);
  await localTracks[0].setMuted(true);
  await localTracks[1].setMuted(true);
  document.getElementById("mic-btn").classList.remove("active");
  document.getElementById("screen-btn").classList.remove("active");
  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[1]]);
};

let handleUserPublisher = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player === null) {
    player = `<div class="video__container" id = "user-container-${user.uid}">
                    <div class="video-player" id ="user-${user.uid}"></div>
               </div>`;
    document
      .getElementById("streams__container")
      .insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener("click", expandVideoFrame);
  }

  if (displayFrame.style.display) {
    let videoFrame = document.getElementById(`user-container-${user.uid}`);
    videoFrame.style.height = "100px";
    videoFrame.style.width = "100px";
  }

  if (mediaType === "video") {
    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play(`user-${user.uid}`);
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();

  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName("video__container");
    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;

  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    sharingScreen = true;
    screenButton.classList.add("active");
    cameraButton.classList.remove("active");
    cameraButton.style.display = "block";
    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = "block";

    let player = `<div class="video__container" id = "user-container-${uid}">
                    <div class="video-player" id ="user-${uid}"></div>
               </div>`;
    displayFrame.insertAdjacentHTML("beforeend", player);

    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);

    await client.publish(localScreenTracks);

    let videoFrames = document.getElementsByClassName("video__container");
    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  } else {
    sharingScreen = false;
    cameraButton.style.display = "block";
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish(localScreenTracks);

    switchToCamera();
  }
};

let toggleBg = async (e) => {
  let bgButton = e.currentTarget;

  if (!setBg) {
    setBg = true;
    bgButton.classList.add("active");

    processor.setOptions({ type: "color", color: "#00ff00" });
    openForm();
    //await processor.enable();
  } else {
    setBg = false;
    bgButton.classList.remove("active");
    closeForm();
    await processor.disable();
  }
};

let toggleLeave = async (e) => {
  window.location = "/";
};

function getValues(event) {
  event.preventDefault();
  console.log(event);
}
async function handleFormSurvey(event) {
  console.log("huu", event);

  event.preventDefault();
  const topic = document.forms["surveyForm"]["topic"].value;
  const capacity = document.forms["surveyForm"]["capacity"].value;
  console.log(topic, capacity);
  if (!topic || !capacity) {
    alert("Vui lòng điền đầy đủ thông tin");
  } else {
    const response = await fetch("http://localhost:3333/meeting/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        code: roomId,
        status: 1,
        topic,
        capacity,
        username: uid,
      }),
    });
    const data = await response.json();
    if (!data.success) {
      window.location = "/";
    }
    console.log(data);
    document.getElementById("surveyForm").style.display = "none";
    checkIsCloseForm = false;
    try {
      const response = await fetch(
        "http://localhost:3333/meeting/create-user-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            code: roomId,
            id: idusmt,
            username: uid,
            starttime: new Date(),
          }),
        }
      );
      const data = await response.json();
    } catch (e) {
      console.log("error", e);
    }
  }
}

async function handleFormSuggestBG(event) {
  console.log("huu", event);

  event.preventDefault();
  console.log(document.forms["bgForm"]);
  const style = document.forms["bgForm"]["style"].value;
  const who = document.forms["bgForm"]["who"].value;
  const impact = document.forms["bgForm"]["impact"].value;
  const workplace = document.forms["bgForm"]["workplace"].value;

  if (!style || !who || !impact || !workplace) {
    alert("Please fill all");
  } else {
    try {
      idsgbg = String(Math.floor(Math.random() * 1000000000000));
      const response = await fetch(
        "http://localhost:3333/meeting/create-choice-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            id: idsgbg,
            style,
            who,
            impact,
            workplace,
            hour: new Date().getHours(),
            idusmt,
          }),
        }
      );
      const data = await response.json();
      console.log(data);

      const response_predict = await fetch("http://127.0.0.1:8000/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data_predict: data.data,
        }),
      });
      const predict = await response_predict.json();

      console.log("predict", predict);
      document.getElementById("bgForm").style.display = "none";
      const response_url = await fetch(
        "http://localhost:3333/meeting/get-URL-img",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: predict,
          }),
        }
      );
      const url = await response_url.json();
      console.log(url);
      idimg = predict;
      await setBackgroundImage(url.data.URL);
    } catch (e) {
      console.log("error", e);
    }
  }
}

function openForm() {
  document.getElementById("bgForm").style.display = "flex";
}

async function closeForm() {
  document.getElementById("bgForm").style.display = "none";
}
async function setBackgroundImage(url) {
  const imgElement = document.createElement("img");
  imgElement.onload = async () => {
    //document.getElementById("loading").style.display = "block";

    //let processor = await getProcessorInstance();

    try {
      processor.setOptions({ type: "img", source: imgElement });
      await processor.enable();
    } finally {
      //document.getElementById("loading").style.display = "none";
    }

    virtualBackgroundEnabled = true;
  };
  // imgElement.src = "/images/bg/bg-congnghe.jpg";
  imgElement.src = url;
  console.log(imgElement.src);

  setTimeout(function () {
    document.getElementById("rate").style.display = "flex";
  }, 3000);
}
async function leaveRoom() {
  const endtime = new Date();
  try {
    const response = await fetch(
      "http://localhost:3333/meeting/update-user-meeting",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          endtime,
          id: idusmt,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.log(e);
  }
}
async function handleVote() {
  try {
    const response = await fetch(
      "http://localhost:3333/meeting/update-choice-meeting",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          rate: rateNum,
          id: idsgbg,
          idimg,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    document.getElementById("rate").style.display = "none";
  } catch (e) {
    console.log(e);
  }
}

async function handleRate(e) {
  let k = e.currentTarget.k;
  rateNum = k;
  for (let i = 1; i <= k; i++) {
    document.getElementById(rateMap.get(i)).src = "./images/star2.png";
  }
  for (let i = k + 1; i <= 5; i++) {
    document.getElementById(rateMap.get(i)).src = "./images/star1.png";
  }
  console.log("rate", k);
}

document
  .getElementById("survey-btn")
  .addEventListener("click", (event) => handleFormSurvey(event));
document
  .getElementById("suggest-bg-btn")
  .addEventListener("click", (event) => handleFormSuggestBG(event));
const star1 = document.getElementById("star1");
star1.k = 1;
star1.addEventListener("click", handleRate);
const star2 = document.getElementById("star2");
star2.k = 2;
star2.addEventListener("click", handleRate);
const star3 = document.getElementById("star3");
star3.k = 3;
star3.addEventListener("click", handleRate);
const star4 = document.getElementById("star4");
star4.k = 4;
star4.addEventListener("click", handleRate);
const star5 = document.getElementById("star5");
star5.k = 5;
star5.addEventListener("click", handleRate);

document.getElementById("btn-vote").addEventListener("click", handleVote);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

document.getElementById("mic-btn").addEventListener("click", toggleMic);

document.getElementById("screen-btn").addEventListener("click", toggleScreen);

document.getElementById("bg-btn").addEventListener("click", toggleBg);

document.getElementById("leave-btn").addEventListener("click", toggleLeave);

window.addEventListener("beforeunload", leaveRoom);

joinRoomInit();
