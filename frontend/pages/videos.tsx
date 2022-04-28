import { useState, useContext, useEffect, useRef } from 'react'
import Head from 'next/head'
import Video from '../assets/video.svg'
import Router from 'next/router'
import Image from 'next/image'
import { Card, TextField } from '@mui/material'
import { useTheme } from "@mui/material"
import { getVideos } from '../scripts/queries'
import { UserContext } from '../scripts/context'
import starEmpty from '../assets/star.svg'
import starHalf from '../assets/star-half.svg'
import starFull from '../assets/star-fill.svg'
import styles from '../styles/Home.module.css'

export default function Videos({ id }: { id: number}) {

  const { user } = useContext(UserContext);
  const theme = useTheme();
  const [videoCatalog, setVideoCatalog] = useState([]);
  const [currentVideo, setCurrentVideo] = useState('');
  const [filterBy, setFilterBy] = useState('');

  const handleGetVideos = async (userId: string) => {
    const request = {
        query: getVideos,
        variables: {
          id: userId
        }
      }
    console.log(request);
    const result = await fetch("http://localhost:1337/graphql", {
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
        if (index >= 0) {
          coll[index].videos.push(item)
        } else {
          coll.push({
            qid: item.attributes.question.data.id,
            question: item.attributes.question.data.attributes.question,
            videos: [item]
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

  const renderVideos = (arr: Array<any>) => {
    return (
    <>
      {arr.filter((v: any) => !v.attributes.title || v.attributes.title?.includes(filterBy) || v.attributes.question.data.attributes.question.includes(filterBy)).map((v: any) => (
        <div 
          key={v.attributes.s3key} 
          style={{ backgroundColor: currentVideo === v.attributes.s3key ? "rgba(0,255,0,0.2)" : "", cursor: 'pointer', padding: "8px", display: 'flex', alignItems: 'center' }} 
          onClick={() => setCurrentVideo(v.attributes.s3key)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={theme.palette.primary.main} viewBox="0 0 16 16">
            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6 6.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43V6.884z"/>
          </svg>
          <span style={{marginLeft: 8}}>
            {v.attributes.title && (<>{v.attributes.title}<br/></>)}
            {v.attributes.rating && (<>{formattedRating(v.attributes.rating)}&nbsp;&nbsp;</>)} 
            <span style={{ fontSize: 'small', opacity: 0.5 }}>{formattedDate(v.attributes.datetime)}</span>
          </span>
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
