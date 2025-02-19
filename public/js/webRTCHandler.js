
import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";


let connectedUserDetails;

const defaultConstraints = {
    audio: true,
    video: true
};

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:13902"
        }
    ]
}

export const getLocalPreview = () => {
    navigator.mediaDevices
        .getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        })
        .catch((error) => {
            console.error("Error accessing media devices.", error);
        });
}


const createPeerConnection = () => {

    peerConnection=new RTCPeerConnection(configuration);

    peerConnection.onicecandidate=(event)=>{
        console.log("getting ice candidates from stun server",event);
        if(event.candidate){
            wss.sendWebRTCCandidate({
                candidate:event.candidate,
                connectedUserSocketId:connectedUserDetails.socketId
            });
        }
        peerConnection.onconnectionstatechange=(event)=>{
            if(peerConnection.connectionState==='connected'){
                console.log("succesfully connected with other peer");
            }
        }
      //receiveing streams
         const remoteStream=new MediaStream();
         store.setRemoteStream(remoteStream);
         ui.updateRemoteVideo(remoteStream);
        peerConnection.ontrack=(event)=>{
            remoteStream.addTrack(event.track);
        }

        //add our stream to peer connection
       if(connectedUserDetails.callType===constants.callType.VIDEO_PERSONAL_CODE){
           const localStream=store.getState().localStream;
           for(const track of localStream.getTracks()){
               peerConnection.addTrack(track,localStream);
           }
       }
    }

}

export const sendPreOffer = (callType, calleePersonalCode) => {

    connectedUserDetails={
        callType,
        socketId:calleePersonalCode
    }
    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        const data={
            callType,
            calleePersonalCode
        }
        ui.showCallingDialog(callingDialogRejectCallHandler);
      wss.sendPreOffer(data);

    }

   
    
}

export const handlePreOffer = (data) => {
    console.log(data);
    const { callType, callerSocketId } = data;
    let callTypeText;
    connectedUserDetails={
      socketId:callerSocketId,
      callType
      
    };

    if(callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.VIDEO_PERSONAL_CODE){
        ui.showIncomingCallDialog(callType,acceptCallHandler,rejectCallHandler);
    }
    
};
const acceptCallHandler=()=>{
    console.log("Call accepted");
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
}
const rejectCallHandler=()=>{ 
    console.log("Call rejected");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}
const callingDialogRejectCallHandler=()=>{  
    console.log("Call rejected");	
};

const sendPreOfferAnswer=(preOfferAnswer)=>{

    const data={
        callerSocketId:connectedUserDetails.socketId,
        preOfferAnswer
    }
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);

}
export const handlePreOfferAnswer= (data) => {
    const { preOfferAnswer } = data;
    ui.removeAllDialogs();
    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED){
        
       ui.showCallElements(connectedUserDetails.callType);
       createPeerConnection();
       sendWebRTCOffer();
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        ui.showInfoDialog(preOfferAnswer);
    }else if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        ui.showInfoDialog(preOfferAnswer);
        
    }else if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        ui.showInfoDialog(preOfferAnswer);
    }
}