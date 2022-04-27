import { useState, useContext, useEffect, useRef } from 'react'
import Head from 'next/head'
import Video from '../assets/video.svg'
import Router from 'next/router'
import Image from 'next/image'
import Card from '@mui/material/card'
import { getVideos } from '../scripts/queries'
import { UserContext } from '../scripts/context'
import styles from '../styles/Home.module.css'

export default function Videos({ id }: { id: number}) {

  const { user } = useContext(UserContext);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState('');

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
      setVideos(reduced);
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

  const renderVideos = (arr: Array<any>) => {
    return (
    <>
      {arr.map((v: any) => (
        <div 
          key={v.attributes.s3key} 
          style={{ backgroundColor: currentVideo === v.attributes.s3key ? "rgba(0,255,0,0.2)" : "", cursor: 'pointer', padding: "8px", display: 'flex', alignItems: 'center' }} 
          onClick={() => setCurrentVideo(v.attributes.s3key)}
        >
          <Image width="25" height="25" alt="video icon" src={Video}/>
          <span style={{marginLeft: 8}}>Recorded on {formattedDate(v.attributes.datetime)}</span>
        </div>
      ))}
    </>)
  }

  const renderQuestions = () => {
    return (
      <>
      {videos.map((q: any) => (
        <Card sx={{ p: 1, mb: 2 }} key={q.qid}>
          <div style={{ padding: "8px" }}><b>{q.question}</b></div>
          {renderVideos(q.videos)}
        </Card>
      ))}
      </>
    )
  }

  const videoRef = useRef(null);

  console.log(currentVideo);

  return (
    <div className={styles.container}>
      <Head>
        <title>Video Interview Practice</title>
        <meta name="description" content="Video interview simulator with some wildcards thrown in." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="videos">
          <h1>Watch Saved Videos</h1>
          {videos?.length > 0 ? renderQuestions() : "No videos available to display"}
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
