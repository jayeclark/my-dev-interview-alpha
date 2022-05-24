import { useState, useContext, useEffect, useRef } from 'react'
import Head from 'next/head'
import Router from 'next/router'
import QuestionList from "../components/QuestionList"
import { getVideos } from '../scripts/queries'
import { UserContext } from '../scripts/context'
import styles from '../styles/Home.module.css'
import { API_URL } from '.'

export default function Videos({ id }: { id: number}) {

  const { user } = useContext(UserContext);
  const initialCatalog: Array<any> = [];
  const [catalog, setCatalog] = useState(initialCatalog);
  const [activeRecords, setActiveRecords] = useState(['']);
  const [activeS3Keys, setActiveS3Keys] = useState(['']);

  const handleSetActiveRecords = (id: string) => {
    setActiveRecords([id]);
  }
  
  const getS3Key = (id: string) => {
    const records = catalog.find(q => q.records.some((x: any) => x.id == id)).records;
    const key = records.find((x: any) => x.id == id).attributes.s3key
    return key;
  }
  const handleSetCatalog = (newCatalog: Array<any>) => {
    setCatalog(newCatalog);
  }

  const handleGetVideos = async (userId: string) => {
    const request = {
        query: getVideos,
        variables: {
          id: userId,
          archive: false
        }
      }
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
    return answers.data;
  }

  useEffect(() => {
    if (user.jwt === '') {
      Router.push("/");
    }
  
    if (catalog.length == 0) {
      handleGetVideos(user.id).then((res) => {
        const sorted = res.sort((a: any, b: any) => a.attributes.question.data.attributes.category - b.attributes.question.data.attributes.category);
        const reduced = sorted.reduce((coll: any, item: any) => {
          const index = coll.findIndex((x: any) => x.qid == item.attributes.question.data.id);
          const videos = item.attributes.videos.data
          const title = item.attributes.title
          const question = item.attributes.question
          if (index >= 0) {
            coll[index].records.push(...videos.filter((x: any) => x.attributes.archive === false).map((x: any) => {
              x.title = title;
              x.question = question;
              return x;
            }))
          } else {
            coll.push({
              qid: item.attributes.question.data.id,
              question: item.attributes.question.data.attributes.question,
              records: [...videos.filter((x: any) => x.attributes.archive === false).map((x: any) => {
              x.title = title;
              x.question = question;
              return x;
            })]
            }) 
          }
          return coll;
        }, [])
        setCatalog(reduced);
      })
    }

  }, [])

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
          {catalog?.length > 0 ? (
            <QuestionList
              catalog={catalog}
              setCatalog={handleSetCatalog}
              style="videos"
              activeRecords={activeRecords}
              setActiveRecords={handleSetActiveRecords}
            />
          ) : "You have not recorded any videos yet. Once you record your first video answer, it will appear here for you to review & manage."}
        </section>
        <section className="viewer">
          <h1>&nbsp;</h1>
        <video style={{ width: '100%', maxWidth: '100%', borderRadius: 6 }} src={activeRecords[0] ? `https://d1lt2f6ccu4rh4.cloudfront.net/${getS3Key(activeRecords[0])}` : ''} controls autoPlay />
        </section>
      </main>
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
