
import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";


let connectedUserDetails;
let peerConnection;
let dataChannel;
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

     peerConnection= new RTCPeerConnection(configuration);
     //create data channel for text messages
        dataChannel=peerConnection.createDataChannel("chat");
        peerConnection.ondatachannel=(event)=>{
           const  dataChannel=event.channel;  
           dataChannel.onopen=()=>{
            console.log("peer connection is ready to recieve datachannel messages");
           }
           dataChannel.onmessage =(event)=>{
            const message=JSON.parse(event.data);
            ui.appendMessage(message);
           }

        }



    peerConnection.onicecandidate=(event)=>{
        console.log("getting ice candidates from stun server",event);
        if(event.candidate){
           wss.sendDataUsingWebRTCSignaling({
            connectedUserSocketId:connectedUserDetails.socketId,
            type:constants.webRTCSignaling.ICE_CANDIDATE,
            candidate:event.candidate,
           });

        }
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

export const sendMessageUsingDataChannel=(message)=>{
    const stringifiedMessage=JSON.stringify(message);
    dataChannel.send(stringifiedMessage);
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
//sending sdp information with the webrtc offer
const sendWebRTCOffer=async()=>{
    const offer=await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId:connectedUserDetails.socketId,
        type:constants.webRTCSignaling.OFFER,
        offer
    });
}

export const handleWebRTCOffer=async(data)=>{

    console.log("web rtc offer came");
    console.log(data);
    // console.log("handling webRTC offer");
    await peerConnection.setRemoteDescription(data.offer);
    const answer=await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId:connectedUserDetails.socketId,
        type:constants.webRTCSignaling.ANSWER,
        answer
    });
}

export const handleWebRTCAnswer=async(data)=>{
    console.log("handling webRTC answer");
    await peerConnection.setRemoteDescription(data.answer);
}

export const handleWebRTCCandidate=async(data)=>{

    try {
        await peerConnection.addIceCandidate(data.candidate);
    }
    catch (err) {
        console.error("Error adding received ice candidate", err);
    }

}
let screenSharingStream;
export const switchBetweenCameraAndScreenSharing=async (screenSharingActive)=>{
    if(screenSharingActive){
        const localStream=store.getState().localStream;
        const sender=peerConnection.getSenders().find((s)=>s.track.kind===localStream.getVideoTracks()[0].kind);
        if(sender){
            await sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
        //stop the screen sharing stream
        store.getState().screenSharingStream.getTracks().forEach((track)=>{
            track.stop();
        });

        store.setScreenSharingActive(!screenSharingActive);
        ui.updateLocalVideo(localStream);
    }
    else{

        try{
            screenSharingStream=await navigator.mediaDevices.getDisplayMedia({
                video:true
            });
            store.setScreenSharingStream(screenSharingStream);
            
            //replace the track the sender is sending 
            const sender=peerConnection.getSenders().find((s)=>s.track.kind===screenSharingStream.getVideoTracks()[0].kind);

            if(sender){
                await sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }


            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
            
        }
        catch(error){
            console.error("Error accessing display media.", error);
        }

    }
}