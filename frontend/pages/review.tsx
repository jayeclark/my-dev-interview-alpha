import { useState, useContext, useEffect, useRef } from 'react'
import Head from 'next/head'
import Video from '../assets/video.svg'
import Router from 'next/router'
import Image from 'next/image'
import axios from 'axios'
import { Card, TextField, Dialog, Button } from '@mui/material'
import { useTheme } from "@mui/material"
import { getVideos } from '../scripts/queries'
import { UserContext } from '../scripts/context'
import { s3 } from "../scripts/s3"
import starEmpty from '../assets/star.svg'
import starHalf from '../assets/star-half.svg'
import starFull from '../assets/star-fill.svg'
import styles from '../styles/Home.module.css'
import { API_URL } from '.'

export default function Videos({ id }: { id: number}) {

  const { user } = useContext(UserContext);
  const theme = useTheme();
  const initialCatalog: Array<any> = [];
  const [videoCatalog, setVideoCatalog] = useState(initialCatalog);
  const [currentVideo, setCurrentVideo] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("delete");
  const [currentModalID, setCurrentModalID] = useState(-1);
  const [currentS3Key, setCurrentS3Key] = useState("");

  const handleGetVideos = async (userId: string) => {
    const request = {
        query: getVideos,
        variables: {
          id: userId,
          archive: false
        }
      }
    console.log(request);
    const result = await fetch(`${API_URL}/graphql`, {
      headers: {
        Authorization: `Bearer ${user.jwt}`,
        "Content-Type": "application/json"
      },
      method: 'POST',
      body: JSON.stringify(request)
    })
    const parsed = await result.json()
    const answers = await parsed.data.answers
    console.log(answers);
    return answers.data;
  }

  useEffect(() => {
    if (user.jwt === '') {
      Router.push("/");
    }
  
    handleGetVideos(user.id).then((res) => {
      const sorted = res.sort((a: any, b: any) => a.attributes.question.data.attributes.category - b.attributes.question.data.attributes.category);
      console.log(sorted);
      const reduced = sorted.reduce((coll: any, item: any) => {
        const index = coll.findIndex((x: any) => x.qid == item.attributes.question.data.id);
        console.log(index);
        const videos = item.attributes.videos.data
        const title = item.attributes.title
        const question = item.attributes.question
        if (index >= 0) {
          coll[index].videos.push(...videos.filter((x: any) => x.attributes.archive === false).map((x: any) => {
            x.title = title;
            x.question = question;
            console.log(x);
            return x;
          }))
        } else {
          coll.push({
            qid: item.attributes.question.data.id,
            question: item.attributes.question.data.attributes.question,
            videos: [...videos.filter((x: any) => x.attributes.archive === false).map((x: any) => {
            x.title = title;
            x.question = question;
            console.log(x);
            return x;
          })]
          }) 
        }
        return coll;
      }, [])
      setVideoCatalog(reduced);
    })
  }, [])

  const formattedDate = (timestamp: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const mm = new Date(timestamp).getMonth();
    const dd = new Date(timestamp).getDate();
    const yyyy = new Date(timestamp).getFullYear();
    const currentYear = new Date(Date.now()).getFullYear();
    return currentYear == yyyy ? `${months[mm]} ${dd}` : `${months[mm]} ${dd}, ${yyyy}`
  }

  const formattedRating = (rating: number) => {
    const empty = <Image src={starEmpty} width={14} height={14} style={{ opacity: 0.5,paddingLeft: 2, marginRight: 2 }} alt="empty star" />
    const half = <Image src={starHalf} width={14} height={14}  style={{ opacity: 0.5,paddingLeft: 2, marginRight: 2 }} alt="half full star" />
    const full = <Image src={starFull} width={14} height={14}  style={{ opacity: 0.5, paddingLeft: 2, marginRight: 2 }} alt="full star" />
    const slots = [2,4,6,8,10];
    return (
      <span style={{ color: "#666!important" }}>
        {slots.map(s => {
          if (rating >= s) { return full; }
          if (rating == s - 1) { return half;}
          return empty;
        })}
      </span>
    )
  }

  const handleArchive = () => {
    const body = {
      data: {
          archive: true
      }
    }
    const headers = {
      Authorization: `Bearer ${user.jwt}`,
      'Content-Type': 'application/json'
    }
    axios.put(`${API_URL}/api/videos/${currentModalID}`, body, {headers}).then(res => {
      const newVideos = videoCatalog.map((cat: {
        videos: Array<any>;
        qid: number; question: string
      }) => {
        cat.videos = cat.videos.filter(x => x.id !== currentModalID)
        return cat;
      }).filter((c) => c.videos.length > 0);
      setVideoCatalog(newVideos);
      console.log(res);
      setShowModal(false);
      setCurrentModalID(-1);
    })
  }

  const handleDelete = async () => {
    const body = {
      id: currentModalID,
      data: {
          archive: true
      }
    }
    const headers = {
      Authorization: `Bearer ${user.jwt}`
    }
    axios.delete(`${API_URL}/api/videos/${currentModalID}`, { headers }).then(async (res) => {
      console.log(res)
      const response = await fetch(`/api/delete-s3?key=${currentS3Key}`, {
        method: "POST",
        headers
      })
      const newVideos = videoCatalog.map((cat: {
        videos: Array<any>;
        qid: number; question: string
      }) => {
        cat.videos = cat.videos.filter(x => x.id !== currentModalID)
        return cat;
      }).filter((c) => c.videos.length > 0);
      setVideoCatalog(newVideos);
      console.log(response);
      setShowModal(false);
      setCurrentModalID(-1);
      setCurrentS3Key("");
    })
  }

  const renderVideos = (arr: Array<any>) => {
    return (
    <>
      {arr.filter((v: any) => !v.attributes.title || v.attributes.title?.includes(filterBy) || v.attributes.question.data.attributes.question.includes(filterBy)).map((v: any, i: number) => (
        <div 
          key={v.attributes.s3key} 
          style={{ backgroundColor: currentVideo === v.attributes.s3key ? "rgba(0,255,0,0.2)" : "", cursor: 'pointer', padding: "8px", display: 'flex', alignItems: 'center', width: '100%', borderTop: i > 0 ? '1px solid #efefef' : 'none' }} 
          onClick={() => setCurrentVideo(v.attributes.s3key)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={theme.palette.primary.main} viewBox="0 0 16 16">
            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6 6.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43V6.884z"/>
          </svg>
          <div style={{marginLeft: 8}}>
            {v.title && (<>{v.title}<br/></>)}
            {v.attributes.rating && (<>{formattedRating(v.attributes.rating)}&nbsp;&nbsp;</>)} 
            <span style={{ fontSize: 'small', opacity: 0.5 }}>{formattedDate(v.attributes.datetime)}</span><br />
          </div>
          <div style={{ flexGrow: 1, margin: '0 8px', display: 'flex', flexWrap: 'nowrap', justifyContent: 'flex-end'}}>
            <svg onClick={(e) => { e.stopPropagation(); setModalMode("archive"); setCurrentModalID(v.id); setShowModal(true) }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 16 16">
                <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/>
              </svg>
              &nbsp;
            <svg onClick={(e) => { e.stopPropagation(); setModalMode("delete"); setCurrentModalID(v.id); setCurrentS3Key(v.attributes.s3key);  setShowModal(true) }}xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 16 16">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
              </svg>
            </div>
        </div>
      ))}
    </>)
  }

  const renderQuestions = () => {
    return (
      <>
      {videoCatalog.filter((q: any) => {
        console.log(q);
        console.log(filterBy);
        console.log(q.question);
        const question = q.question as string; 
        const videos = q.videos;
        return (question && question.match(filterBy)) || videos.some((v: any) => v.attributes.title?.match(filterBy))
      })
        .map((q: any) => (
        <Card sx={{ p: 1, mb: 2 }} key={q.qid}>
          <div style={{ padding: "8px" }}><b>{q.question}</b></div>
          {renderVideos(q.videos)}
        </Card>
      ))}
      </>
    )
  }

  console.log(currentVideo);

  return (
    <div className={styles.container}>
      <Head>
        <title>My Dev Interview - Video Interview Practice App</title>
        <meta name="description" content="Video interview simulator with some wildcards thrown in." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="videos">
          <h1>My Saved Videos</h1>
          <TextField 
            onChange={(e) => setFilterBy(e.target.value)} 
            id="filter" 
            name="filter"
            label="Filter by question or video title"
            style={{ backgroundColor: theme.palette.background.paper,  width: "100%", marginBottom: 16 }}
          />
          {videoCatalog?.length > 0 ? renderQuestions() : "No videos available to display"}
        </section>
        <section className="viewer">
          <h1>&nbsp;</h1>
        <video style={{ width: '100%', maxWidth: '100%', borderRadius: 6 }} src={currentVideo ? `https://d1lt2f6ccu4rh4.cloudfront.net/${currentVideo}` : ''} controls autoPlay >
        </video>
        </section>
      </main>
      <Dialog open={showModal}>
        <Card sx={{ p: 4 }}>
          <div style={{ marginBottom: 24 }}>Are you sure you want to {modalMode} this video?</div>
          <div>
            <Button style={{ width: 'calc(50% - 4px', marginRight: 8 }} variant="outlined" onClick={() => {
              setCurrentModalID(-1);
              setCurrentS3Key("");
              setShowModal(false);
            }}>Cancel</Button>
            <Button style={{ width: 'calc(50% - 4px' }}  variant="contained" onClick={() => modalMode == "archive" ? handleArchive() : handleDelete()}>{modalMode === "archive" ? "Archive" : "Delete"}</Button>
          </div>
        </Card>
      </Dialog>
      <footer className={styles.footer}>
        <a
          href="https://github.com/jayeclark"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; 2022 Jay Clark
        </a>
      </footer>
      <style jsx>{`
        main {
          display: flex;
          flex-wrap: nowrap;
          flex-direction: row;
          align-items: flex-start;
        }
        .videos {
          width: calc(40vw - 4rem - 16px);
          margin-right: 2rem;
          max-height: calc(100vh - 67px);
          overflow-y: scroll;
        }
        .viewer {
          width: calc(60vw - 2rem - 16px);
        }
        .viewer video {
          height: calc(0.75 * (60vw - 2rem - 16px))
        }
      `}</style>
    </div>
  )
}
