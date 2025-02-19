let state={
    socketId:null,
    localStream:null,
    remoteStream:null,
    screenSharingStream:null,
    allowConnectionsFromStrangers:false,
    screenSharingActive:false,
    
}
export const setSocketId=(socketId)=>{
    state={
        ...state,
        socketId:socketId
    }
    console.log(state);
}
export const setLocalStream=(stream)=>{
    state={
        ...state,
        localStream:stream
    }
}

export const setAllowConnectionsFromStrangers=(allowConnections)=>{
    state={
        ...state,
        allowConnectionsFromStrangers:allowConnections
    }
}
export const setScreenSharingActive=(screenSharingActive)=>{
    state={
        ...state,
        screenSharingActive:screenSharingActive
    }
}
export const setScreenSharingStream=(stream)=>{
    state={
        ...state,
        screenSharingStream:stream
    }
}
export const setRemoteStream=(stream)=>{    
    state={
        ...state,
        remoteStream:stream
    }
}

export const getState=()=>{
    return state;
}