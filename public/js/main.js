import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import { getIncomingCallDialog } from "./elements.js";


const socket = io("/");

wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

const personalCodeCopyButton = document.getElementById(
  "personal_code_copy_button"
);

//register event listener for copy button
personalCodeCopyButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

//register event listeners for connection buttons

const personalCodeChatButton=document.getElementById('personal_code_chat_button');

const personalCodeVideoButton=document.getElementById('personal_code_video_button');

personalCodeChatButton.addEventListener('click',()=>{
    const calleePersonalCode=document.getElementById('personal_code_input').value;
    const callType=constants.callType.CHAT_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType,calleePersonalCode);
});
personalCodeVideoButton.addEventListener('click',()=>{
    console.log("Video button clicked");
    const calleePersonalCode=document.getElementById('personal_code_input').value;
    const callType=constants.callType.VIDEO_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType,calleePersonalCode);
 
});

//eventlisteners for video call buttons

//disabling the mic and camera buttons
const micButton = document.getElementById("mic_button")
console.log(micButton,"mic button");
micButton.addEventListener('click',()=>{
  console.log("mic button clicked");
  const localStream=store.getState().localStream;
  const micEnabled=localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled=!micEnabled;
  ui.updateMicButton(micEnabled);
})

const cameraButton = document.getElementById('camera_button')
cameraButton.addEventListener('click',()=>{
  console.log("camera button clicked");
  const localStream=store.getState().localStream;
  const cameraEnabled=localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled=!cameraEnabled;
  ui.updateCameraButton(cameraEnabled);
})

//screen share button
const switchScreenSharingButton = document.getElementById('screen_sharing_button')
switchScreenSharingButton.addEventListener('click',()=>{
  const screenSharingActive=store.getState().screenSharingActive;
  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
})


//messenger

const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
  if(event.key=== "Enter"){
    ui.appendMessage(event.target.value,true);
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    newMessageInput.value="";
  }	
})

const sendMessageButton=document.getElementById("send_message_button");
sendMessageButton.addEventListener('click',(event)=>{
  const message=newMessageInput.value;
  webRTCHandler.sendMessageUsingDataChannel(message);
  ui.appendMessage(message,true);
  newMessageInput.value="";
})