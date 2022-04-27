import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import RecordView from '../components/RecordView'
import { getQuestionIDs, getQuestion } from '../scripts/queries'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const theme = useTheme();
  const API_URL = process.env.API_URL || 'http://localhost:1337'
  const askedArray: Array<number> = []
  const [question, setQuestion] = useState({id: -1, content: '', category: ''});
  const [count, setCount] = useState(0);
  const [asked, setAsked] = useState(askedArray);

  useEffect(() => {
    getQuestionCount().then(async (res) => {
      setCount(res);
      const newQuestion = await getNextQuestion(res);
      setQuestion(newQuestion);
    })
  }, [])

  const getQuestionCount = async () => {
    let currentCount = 1000;
    let totalCount = 0;
    while (currentCount == 1000) {
      const response = await fetch(`${API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getQuestionIDs
        })
      })
      const parsedResponse = await response.json();
      const data = await parsedResponse.data.questions.data;
      totalCount += data.length;
      currentCount = data.length;
    }

    return totalCount;
  }

  const getPreviousQuestion = async (idToFetch: number) => {
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getQuestion,
        variables: {
          id: idToFetch
        }
      })
    })
    const parsedResponse = await response.json();
    const { data } = await parsedResponse;
    const { question } = await data;
    return {
      id: idToFetch,
      content: question.data.attributes.question,
      category: question.data.attributes.category
      };
  }

  const getNextQuestion = async (length = count) => {
    let idToFetch = -1;
    while (idToFetch < 0) {
      const randomID = parseInt((Math.random() * (length - 1)).toFixed(0));
      if (asked.includes(randomID + 1) === false || (asked.length >= 30 && asked.slice(asked.length - 15).includes(randomID + 1) === false)) {
        idToFetch = randomID + 1;
      }
    }
  
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getQuestion,
        variables: {
          id: idToFetch
        }
      })
    })
    const parsedResponse = await response.json();
    const { data } = await parsedResponse;
    const { question } = await data;
    return {
      id: idToFetch,
      content: question.data.attributes.question,
      category: question.data.attributes.category
      };
  }

  const handleNext = async () => {
    const newAsked = [...asked];
    newAsked.push(question.id);
    setAsked(newAsked);
    getNextQuestion(count).then((res) => {
      setQuestion(res);
    })
  }

  const handlePrevious = async () => {
    getPreviousQuestion(asked[asked.length - 1]).then((res) => {
      setQuestion(res);
    })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Video Interview Practice</title>
        <meta name="description" content="Video interview simulator with some wildcards thrown in." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="question">
          <Card variant="outlined" sx={{ mb: theme.spacing(2), p: theme.spacing(3), display: 'flex', width: '100%', height: '10vw', minHeight: '100px', alignItems: 'center', justifyContent: 'center' }}>
            <div><b>{question.content}</b></div>
          </Card>
          <RecordView key={question.id} questionId={question.id}/>
          <div className="buttons">
            <div>
            {asked.length > 0 && <Button size="large" variant="text" onClick={handlePrevious}>&lt;&lt;&nbsp;Previous Question</Button>}
            
            </div>
            <div>
            <Button size="large" variant="text" onClick={handleNext}>Skip Question&nbsp;&gt;&gt;</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; 2022 Jay Clark
        </a>
      </footer>
      <style jsx>{`
        .question {
          width: calc(min(80vh, 80vw));
          height: calc(min(60vh, 60vw) + 182px);
          min-width: calc(min(80vh, 80vw));
          min-height: calc(min(60vh, 60vw) + 182px);
          max-width: 1600px;
          max-height: 1200px
        }
        .buttons {
          display: flex!important:
          flex-wrap: nowrap;
          width: 100%;
          flex-wrap: nowrap;
          justify-content: space-between;
          justify-items: space-between;
          align-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}

export default Home
