import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { useReactMediaRecorder } from "react-media-recorder";
import { UserContext } from "../scripts/context";

const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timeDelay = setTimeout(() => {}, 10);
    if (stream && stream.active) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setLoading(false)
      }
    }
  }, [stream, loading]);

  return (<>
          <div id="video-container" className="video-container">
            Loading, please wait...
            <video style={{ position: 'absolute', top: 0, left: 0, opacity: loading ? 0 : 1, transition: 'opacity 1.5s ease' }} ref={videoRef} autoPlay />
          </div>
          <style jsx>{`
            .video-container {
              width: 100%;
              height: calc(min(60vh, 60vw));
              background-color: black!important;
              max-width: 100%;
              max-height: 100%;
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            video {
              width: 100%;
              max-width: 100%;
              max-height: 100%;
            }
          `}</style>
          </>);
};

const RecordView = ({ questionId }: { questionId: number }) => {
  const { user } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const [displayRecording, setDisplayRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);


  const { startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({ video: true });

  const handleSave = async () => {
    const mediaBlob: Blob = await fetch(mediaBlobUrl as string).then (res => res.blob());
    const dateStamp: number = new Date(Date.now()).getTime();
    const fileName = user.id + "-" + dateStamp;
    const file = new File([mediaBlob], `${fileName}.mp4`, { type: 'video/mp4' });

    const formData = new FormData();
    formData.append("file", file);

    const s3result: any = await fetch(`/api/sign-s3?id=${user.id}`, {
      method: "POST",
      body: formData
    })
    const bodyText = await s3result.json();
    const body = {
      data: {
          s3key: bodyText.filename,
          users: user.id,
          user_id: user.id,
          datetime: new Date(Date.now()).getTime(),
          question: questionId,
      }
    }
    const headers = {
      Authorization: `Bearer ${user.jwt}`
    }

    axios.post('http://localhost:1337/api/answers', body, { headers }).then(res => {
      console.log(res);
    })
  }

  const handleStart = () => {
    setPlaying(false);
    startRecording();
    setRecording(true);
    setTimeout(() => setDisplayRecording(true), 1500);
  }

  const handleWatch = () => {
    setPlaying(true);
    if (activeVideoPlayer.current) {
      const element: HTMLVideoElement = activeVideoPlayer.current
      element.play()
    }
  }

  const handleStop = () => {
    stopRecording();
    setHasRecorded(true);
    setRecording(false);
    setTimeout(() => setDisplayRecording(false), 500);
  }

  const buttonStyle = {
    m: 1, 
    width: 250  
  }

  const cornerStyle = {
    position: 'absolute!important',
    top: '16px',
    right: '16px',
  }

  const cornerStyleLower = {
    position: 'absolute!important',
    top: '74.25px',
    right: '16px',
  }

  const activeVideoPlayer = useRef(null);

  return (
    <>
      <section id="record-answer" className="answer-container">
        <div className="video-screen">
          {recording ? <VideoPreview stream={previewStream} /> : <video ref={activeVideoPlayer} src={mediaBlobUrl || ''} controls autoPlay={playing ? true: false} />}
          <div className="overlay" style={{ visibility: !playing && !recording ? "visible" : "hidden",  backdropFilter:  !playing && !recording ? 'blur(20px)' : '' }}>
          { !recording && (
            <>
            {hasRecorded && (
              <>
                <Button sx={{...buttonStyle}} size="large" variant="contained" onClick={handleWatch}><b>Watch your answer</b></Button>
                <div style={{width: '100%'}}></div>
              </>
            )}
              <Button sx={{...buttonStyle}} size="large" variant={hasRecorded ? "outlined" : "contained"} onClick={handleStart}><b>{hasRecorded ? "Try Again" : "Record an answer"}</b></Button>
            </>
            
          )}
          </div>
          {recording && displayRecording && (
            <>
              <div className="stop-button" >
                <Button size="large" variant="contained" color="error" onClick={handleStop}><b>Stop Recording</b></Button>
              </div>
              {displayRecording && <div className="recording-indicator"></div>}
            </>
          )}
          {playing && (
            <Button sx={{...buttonStyle, ...cornerStyleLower, opacity: 0.85, background: "#fff" }} size="large" variant="outlined" onClick={handleStart}><b>Try Again</b></Button>
          )}
          {playing && user.email && (
            <Button sx={{...buttonStyle, ...cornerStyle }} size="large" variant="contained" onClick={handleSave}><b>Save Answer</b></Button>
          )}
        </div>
       

      </section>
      <style jsx>{`
        .answer-container {
          position: relative;
        }

        .video-screen {
          width: calc(min(80vh, 80vw));
          height: calc(min(60vh, 60vw));
          min-width: calc(min(80vh, 80vw));
          min-height: calc(min(60vh, 60vw));
          max-width: 1600px;
          max-height: 1200px;
          position: relative;
        }

        video {
          width: calc(min(80vh, 80vw));
          height: calc(min(60vh, 60vw));
          min-width: calc(min(80vh, 80vw));
          min-height: calc(min(60vh, 60vw));
          border-radius: 6px;
        }
        
        .overlay {
           opacity: 0.95;
           background-color: transparent;
           width: 100%;
           height: 100%;
           position: absolute;
           top: 0px;
           left: 0px;
           z-index: 999;
           display: flex;
           flex-wrap: wrap;
           justify-content: center;
           align-content: center;
        }

        .record-button-watching {
          position: absolute!important;
          top: 16px;
          right: 16px;
        }

        .stop-button {
          position: absolute!important;
          top: 16px;
          right: 16px;
        }

        .recording-indicator {
          position: absolute!important;
          top: 24px;
          left: 24px;
          border-radius: 12px;
          height: 12px;
          width: 12px;
          outline: 2px solid white;
          outline-offset: 2px;
          background-color: red;
        }

        .recording-indicator::after {
          content: "Recording";
          color: white;
          font-weight: 600;
          margin-left: 24px;
          font-size: 0.8em;
          line-height: 14px;
          position: absolute;
        }
      `}</style>
    </>
  );
};

export default RecordView;