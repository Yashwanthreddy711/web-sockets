
import * as constants from './constants.js';
import * as elements from './elements.js';
export const updatePersonalCode = (personalCode) => {   
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');
   personalCodeParagraph.innerText=personalCode;
}

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;
    localVideo.addEventListener('loadedmetadata',()=>{
        localVideo.play();
    })
}
export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;
    remoteVideo.addEventListener('loadedmetadata',()=>{
        remoteVideo.play();
    })
}

export const showIncomingCallDialog = (callType,acceptCallHandler,rejectCallHandler) => {

    const callTypeInfo=callType===constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";

    const incomingDialog= elements.getIncomingCallDialog(callTypeInfo,acceptCallHandler,rejectCallHandler);

    const dialog= document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach(dialog => dialog.remove());
    dialog.appendChild(incomingDialog);


}

export const showCallingDialog= (rejectCallHandler)=>{
    const callingDialog=elements.getCallingDialog(rejectCallHandler);
    const dialog= document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach(dialog => dialog.remove());
    dialog.appendChild(callingDialog);
}
export const removeAllDialogs = () => {
    const dialog = document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach(dialog => dialog.remove());
}
export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;
    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        infoDialog = elements.getInfoDialog("Callee not found","please check personal code");
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){ 
        infoDialog = elements.getInfoDialog("Callee is not available","please try again later");         
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        infoDialog = elements.getInfoDialog("Call rejected",
            "Callee rejected your call"); 
    }

    if(infoDialog){
        const dialog = document.getElementById('dialog');
        dialog.appendChild(infoDialog);
        setTimeout(()=>{
            removeAllDialogs();
        },4000);
    }

   
}

export const showCallElements = (callType) => { 
    if(callType === constants.callType.CHAT_PERSONAL_CODE){
        showChatCallElements();
    }else if(callType === constants.callType.VIDEO_PERSONAL_CODE){
        showVideoCallElements();
    }
}

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById('finish_chat_button_container');
    showElement(finishConnectionChatButtonContainer);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);
    disableDashboard();
}
const showVideoCallElements = () => {
    const callButtons = document.getElementById('call_buttons');
    //hideElement(callButtons);
    showElement(callButtons);

    const placeholder = document.getElementById('video_placeholder');
    hideElement(placeholder);

    // const callButtonsVideo = document.getElementById('call_buttons_video');
    // showElement(callButtonsVideo);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);

    disableDashboard();
}

//ui call buttons

const micOnImgSrc='./utils/images/mic.png'
const micOffImgSrc='./utils/images/micOff.png'

export const updateMicButton = (micActive) => {
    const micButtonImage = document.getElementById("mic_button_image");
    micButtonImage.src=micActive ? micOffImgSrc : micOnImgSrc;
    // if(micActive){
    //     micButton.classList.remove('active');
    // }else{
    //     micButton.classList.add('active');
    // }
}
const cameraOnImgSrc='./utils/images/camera.png'
const cameraOffImgSrc='./utils/images/cameraOff.png'
export const updateCameraButton = (cameraActive) => {
    const cameraButtonImage = document.getElementById("camera_button_image");
    cameraButtonImage.src=cameraActive ?cameraOffImgSrc:cameraOnImgSrc ;
    // if(cameraActive){
    //     cameraButton.classList.remove('active');
    // }else{
    //     cameraButton.classList.add('active');
    // }
}

//ui messgages

export const appendMessage=(message,right=false)=>{
    console.log("append message called",message);
    const messagesContainer = document.getElementById('messages_container');
    const messageElement= right ? elements.getRightMessage(message) : elements.getLeftMessage(message);
    messagesContainer.appendChild(messageElement);
    // messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
export const clearMessenger=()=>{
    const messagesContainer = document.getElementById('messages_container');
    messagesContainer.querySelectorAll('*').forEach(message => message.remove());
}

//ui helper functions

const enableDashboard= () => {
    const dashboardBlocker=document.getElementById('dashboard_blur');
    if(!dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.add('display_none');
    }
}

const disableDashboard= () => {
    const dashboardBlocker=document.getElementById('dashboard_blur');
    if(dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.remove('display_none');
    }
}

const hideElement = (element) => {
    if(!element.classList.contains('display_none')){
        element.classList.add('display_none');
    }
}

const showElement = (element) => {
    if(element.classList.contains('display_none')){
        element.classList.remove('display_none');
    }
}
