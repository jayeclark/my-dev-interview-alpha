import React, { FormEvent } from 'react'
import { useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";
import Head from 'next/head'
import Video from '../assets/video.svg'
import Router from 'next/router'
import Image from 'next/image'
import axios from 'axios'
import RecordView from '../components/RecordView'
import { Card, TextField, Button, Dialog, ToggleButton } from '@mui/material'
import { useTheme } from "@mui/material"
import Markdown from 'markdown-to-jsx';
import { getPlans, getQuestions } from '../scripts/queries'
import { UserContext } from '../scripts/context'
import starEmpty from '../assets/star.svg'
import starHalf from '../assets/star-half.svg'
import starFull from '../assets/star-fill.svg'
import styles from '../styles/Home.module.css'
import { API_URL } from '.';

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false
});

export default function Plans({ id }: { id: number}) {

  const { user } = useContext(UserContext);
  const router = useRouter();
  const theme = useTheme();

  interface Plan {
    id: number;
    attributes?: any
  }
  const plan: Plan = { id: 0 }
  const catalog: Array<any> = [];
  const [planCatalog, setPlanCatalog] = useState(catalog);
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [currentModalID, setCurrentModalID] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('delete')
  const [filterBy, setFilterBy] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [editPrompts, setEditPrompts] = useState(false);
  const [planMode, setPlanMode] = useState("edit");
  const [searchFor, setSearchFor] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchResults, setSearchResults] = useState(catalog);

  const handleGetPlans = async (userId: string) => {
    const request = {
        query: getPlans,
        variables: {
          id: userId
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
  
    handleGetPlans(user.id).then((res) => {
      const sorted = res.sort((a: any, b: any) => a.attributes.question.data.attributes.category - b.attributes.question.data.attributes.category);
      console.log(sorted);
      const reduced = sorted.reduce((coll: any, item: any) => {
        const index = coll.findIndex((x: any) => x.qid == item.attributes.question.data.id);
        console.log(index);
        if (index >= 0 && item.attributes.datetime_planned > 0) {
          coll[index].plans.push(item)
        } else if (item.attributes.datetime_planned > 0) {
          coll.push({
            qid: item.attributes.question.data.id,
            question: item.attributes.question.data.attributes.question,
            plans: [item]
          }) 
        }
        return coll;
      }, [])
      setPlanCatalog(reduced);
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

  const handleUpdate = async (e: any, payload: object) => {
    e.preventDefault();
    const headers = {
      Authorization: `Bearer ${user.jwt}`,
      'Content-Type': 'application/json'
    }
    if (planMode == "edit") {
      const body = {
        data: { ...payload}
      }
      await axios.put(`${API_URL}/api/answers/${currentPlan.id}`, body, { headers }).then(() => {
        const newPlan = { ...currentPlan };
        newPlan.attributes = { ...newPlan.attributes, ...payload };

        const qIndex = planCatalog.findIndex((q: any) => q.plans.some((x: any) => x.id == currentPlan.id))
        const newQ = { ...planCatalog[qIndex] };
        const pIndex = newQ.plans.findIndex((p: any) => p.id == currentPlan.id)
        const newPlans = [...newQ.plans];
        newPlans[pIndex] = newPlan;
        newQ.plans = newPlans;
        console.log(newPlan);
        const newCatalog = [ ...planCatalog ];
        newCatalog[qIndex] = newQ;
        console.log(newCatalog[qIndex]);
        const key = Object.keys(payload)[0]
        if (key === "title") {
          setEditTitle(false)
        }
        if (key === "planned_answer") {
          setEditPlan(false);
        }
        if (key === "prompts") {
          setEditPrompts(false);
        }
        setCurrentPlan(newPlan);
        setPlanCatalog(newCatalog);
      })
    } else {
      const body = {
        data: {
          ...payload,
          users: user.id,
          user_id: user.id,
          datetime_planned: new Date(Date.now()).getTime(),
          question: currentPlan.attributes.question.data.id,
        }
      }

      await axios.post(`${API_URL}/api/answers/`, body, { headers }).then((res) => {
        console.log(res);
        const qid = currentPlan.attributes.question.data.id;

        const qIndex = planCatalog.findIndex((q: any) => q.qid === qid);
        const newQ = { ...planCatalog[qIndex] };
        const plan = {
          id: res.data.data.id,
          attributes: {
            ...res.data.data.attributes,
            question: {
              data: {
                id: currentPlan.attributes.question.data.id,
                attributes: {
                  question: currentPlan.attributes.question.data.attributes.question
                }
              }
            }
          }
        };
        newQ.plans.push(plan);
        console.log('plan', plan);
        const newCatalog = [ ...planCatalog ];
        newCatalog[qIndex] = newQ;
        console.log(newCatalog[qIndex]);
        const key = Object.keys(payload)[0]
        if (key === "title") {
          setEditTitle(false)
        }
        if (key === "planned_answer") {
          setEditPlan(false);
        }
        if (key === "prompts") {
          setEditPrompts(false);
        }

        
        setCurrentPlan(plan);
        setPlanCatalog(newCatalog);
        setPlanMode("edit");
      })
    }

  }

  const createNewAnswer = (qid: number, question: string) => {
    const newPlan = {
      id: 0,
      attributes: {
        title: "",
        planned_answer: "",
        prompts: "",
        question: {
          data: {
            id: qid,
            attributes: {
              question: question
            }
          }
        }
      }
    };
    // Add in a check -- don't add the question to the catalg if already there
    const newPlanCatalog = [...planCatalog, { qid: qid, question: question, plans: [] }]
    console.log(newPlanCatalog);
    setPlanCatalog(newPlanCatalog);
    setPlanMode("create");
    setCurrentPlan(newPlan);
    setEditTitle(true);
    setEditPlan(true);
    setEditPrompts(true);
  }

  const renderAnswerPlans = (arr: Array<any>) => {
    return (
    <>
      {arr.filter((p: any) => !p.attributes.title || p.attributes.title?.includes(filterBy) || p.attributes.question.data.attributes.question.includes(filterBy)).map((p: any) => (
        <div 
          key={p.id} 
          style={{ backgroundColor: currentPlan.id === p.id ? "rgba(0,255,0,0.2)" : "", cursor: 'pointer', padding: "8px", display: 'flex', alignItems: 'center' }} 
          onClick={() => {
            setEditTitle(false);
            setEditPlan(false);
            setEditPrompts(false);
            setCurrentPlan(p)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={theme.palette.primary.main} viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span style={{marginLeft: 8}}>
            {p.attributes.title && (<>{p.attributes.title}<br/></>)}
            <span style={{ fontSize: 'small', opacity: 0.5 }}>Planned {formattedDate(p.attributes.datetime_planned)}
              {p.attributes.videos?.data.length > 0 && (
                <>
                  {" | "}
                  {p.attributes.videos.data.length} answer{p.attributes.videos.data.length == 1 ? "" : "s"}
                </>
              )}
              </span>
          </span>
          <span style={{ marginLeft: 8, flexShrink: 0, flexGrow: 1, textAlign: "right", cursor: "pointer" }}>
            <abbr title="Record an answer">
              <svg style={{ margin: 4 }} onClick={(e) => {
                e.stopPropagation();
                console.log('clicked');
                setEditTitle(false);
                setEditPlan(false);
                setEditPrompts(false);
                setCurrentPlan(p);
                setPlanMode('record');
              }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
              </svg>
            </abbr>
            <abbr title="Archive Plan">
              <svg  style={{ margin: 4 }} onClick={(e) => { e.stopPropagation(); setModalMode("archive"); setCurrentModalID(p.id); setShowModal(true) }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 16 16">
                <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/>
              </svg>
            </abbr>
            <abbr title="">
              <svg style={{ margin: 4, marginRight: 0 }}  onClick={(e) => { e.stopPropagation(); setModalMode("delete"); setCurrentModalID(p.id);  setShowModal(true) }}xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 16 16">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
              </svg>
            </abbr>
          </span>
        </div>
      ))}
    </>)
  }

  const renderQuestions = () => {
    return (
      <>
      {planCatalog.filter((q: any) => {
        console.log(q);
        console.log(filterBy);
        console.log(q.question);
        const question = q.question as string; 
        const plans = q.plans;
        return (question && question.match(filterBy)) || plans.some((v: any) => v.attributes.title?.match(filterBy))
      })
        .map((q: any) => (
        <Card sx={{ p: 1, mb: 2 }} key={q.qid}>
            <div style={{ padding: "8px", display: "flex", flexWrap: "nowrap", alignItems: "center" }}><div><b>{q.question}</b>&nbsp;&nbsp;&nbsp;</div>
              <abbr style={{ marginTop: 4, cursor: "pointer" }} title="Add New Answer" onClick={() => createNewAnswer(q.qid, q.question)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </abbr>
            </div>
          {renderAnswerPlans(q.plans)}
        </Card>
      ))}
      </>
    )
  }

  const renderResults = () => {
    return (
      <>
      {searchResults.map((q: any) => (
        <Card sx={{ p: 1, mb: 2 }} key={q.qid}>
            <div style={{ padding: "8px", display: "flex", flexWrap: "nowrap", alignItems: "center" }}><div><b>{q.attributes.question}</b>&nbsp;&nbsp;&nbsp;</div>
            </div>
          <div style={{ padding: "8px", display: "flex", flexWrap: "nowrap", alignItems: "center" }}>
            <abbr style={{ marginTop: 4, cursor: "pointer" }} title="Add New Answer" onClick={() => createNewAnswer(q.id, q.attributes.question)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </abbr>
            <div>&nbsp;&nbsp;&nbsp;Plan an answer to this question</div>
          </div>
        </Card>
      ))}
      </>
    )
  }
  
  const removeFromCatalog = (id: number) => {
    const newCatalog = planCatalog
      .map((cat: {
          plans: Array<any>;
          qid: number; question: string
        }) => {
          cat.plans = cat.plans.filter(x => x.id !== id)
          return cat;
      })
      .filter((c) => c.plans.length > 0);
    setPlanCatalog(newCatalog); 
    if (currentPlan.id == id) {
      setCurrentPlan({ id: 0, attributes: {} })
    }
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
    axios.put(`${API_URL}/api/answers/${currentModalID}`, body, {headers}).then(res => {
      removeFromCatalog(currentModalID);
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
    axios.delete(`${API_URL}/api/answers/${currentModalID}`, { headers }).then(async (res) => {
      console.log(res)
      removeFromCatalog(currentModalID);
      setShowModal(false);
      setCurrentModalID(-1);
    })
  }

  const handleSearch = async (e: any) => {
    console.log("searchcaled")
    e.preventDefault();
    console.log(e.target.search.value)
    if (searchFor.length > 0) {
        const request = {
          query: getQuestions,
          variables: {
            search: e.target.search.value,
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
      const questions = await parsed.data.questions
      console.log(questions);
      const questionData = await questions.data;
      setSearchResults(questionData);
      setSearched(true);
      setSearchFor("");
      e.target.search.value = "";
    }
  }

  console.log('curr', currentPlan);
  console.log('mode', planMode);

  return (
    <div className={styles.container}>
      <Head>
        <title>My Dev Interview - Video Interview Practice App</title>
        <meta name="description" content="Video interview simulator with some wildcards thrown in." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="videos">
          <h1>Plan a New Answer</h1>
          <form onSubmit={handleSearch}>
            <TextField 
              id="search" 
              name="search"
              label="Search for a question"
              onChange={(e) => { setSearchFor(e.target.value); if (searched) { setSearched(false) } }}
              style={{ backgroundColor: theme.palette.background.paper,  width: "100%", marginBottom: 16 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <Button sx={{ mr: 2, mb: 2 }} type="reset" variant="outlined" onClick={() => {
                setSearchResults([]);
                setSearchFor("");
                setSearched(false);
              }}>Clear</Button>
              <Button sx={{ mb: 2 }}type="submit" variant="contained">Search</Button>
            </div>
          </form>

            {searchResults?.length > 0 ? renderResults() : searched === false ? "" : "No questions match that search." }
          <h1>My Planned Answers</h1>
          <TextField 
            onChange={(e) => setFilterBy(e.target.value)} 
            id="filter" 
            name="filter"
            label="Filter by question"
            style={{ backgroundColor: theme.palette.background.paper,  width: "100%", marginBottom: 16 }}
          />
          {planCatalog?.length > 0 ? renderQuestions() : "No plans available to display"}
        </section>
        <section className="viewer">
          <h1>&nbsp;</h1>
          {(currentPlan.id > 0 || planMode == "create") && (<>
            <Card variant="outlined" sx={{ mb: theme.spacing(2), p: theme.spacing(2), display: 'flex', width: '100%', height: '10vh', minHeight: '80px', alignItems: 'center', justifyContent: 'center' }}>
              <div><b>{currentPlan.attributes.question.data.attributes.question}</b></div>
            </Card>
                      {currentPlan.id > 0 && planMode == "record" && (
            <>
              <RecordView
                questionId={currentPlan.attributes.question.data.id}
                title={currentPlan.attributes.title}
                answerId={currentPlan.id}
                />
                <Button style={{ marginTop: 48 }} type="button" onClick={() => setPlanMode('edit')}>Cancel Recording</Button>
            </>
          )}
            {planMode !== 'record' && (
              <>
                <h3 style={{ marginBottom: 0 }}>
                  Story Title&nbsp;&nbsp;
                  {editTitle === false && (
                    <svg style={{ cursor: 'pointer' }} onClick={() => setEditTitle(true)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                  )}
                </h3>
                {editTitle == false && (
                  <p style={{ marginBottom: 32 }}>{currentPlan.attributes.title}</p>
                )}
                {editTitle && (
                  <form onSubmit={(e: any) => handleUpdate(e, { title: e.target.title.value })} style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", width: "100%", margin: "8px 0px" }}>
                    <TextField
                      name="title"
                      style={{ flexGrow: 1, width: "100%", backgroundColor: theme.palette.background.paper,}}
                      defaultValue={currentPlan.attributes.title}
                    />
                    <Button sx={{ mt: 1 }} onClick={() => setEditTitle(false)} type="button" variant="outlined">Cancel</Button>
                    <Button sx={{ mt: 1, ml: 1 }} type="submit" variant="contained">Save</Button>
                  </form>
                )}
                <h3 style={{ marginBottom: 8 }}>Narrative&nbsp;&nbsp;
                  {editPlan === false && (
                    <svg style={{ cursor: 'pointer' }} onClick={() => setEditPlan(true)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                  )}
                </h3>
                <div style={{ marginBottom: 32 }}>
                  {editPlan === false && (
                    <Markdown>{currentPlan.attributes.planned_answer || ""}</Markdown>
                  )}
                {editPlan && (
                  <form onSubmit={(e: any) => handleUpdate(e, { planned_answer: e.target.planned_answer.value })} style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
                    <MdEditor
                      name="planned_answer"
                      defaultValue={currentPlan.attributes.planned_answer || ""}
                      style={{ height: "auto", width: "100%" }}
                      renderHTML={(text) => <ReactMarkdown>{text || ""}</ReactMarkdown>}
                    />
                    <Button sx={{ mt: 1 }} onClick={() => setEditPlan(false)} type="button" variant="outlined">Cancel</Button>
                    <Button sx={{ mt: 1, ml: 1 }} type="submit" variant="contained">Save</Button>
                  </form>
                )}
                </div>
              </>
            )}
            <h3 style={{ marginBottom: 8 }}>Prompts&nbsp;&nbsp;
              {editPrompts === false && (
                <svg style={{ cursor: 'pointer' }} onClick={() => setEditPrompts(true)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
              </svg>
              )}
            </h3>
            <div style={{ marginBottom: 32 }}>
              {editPrompts === false && (
                <Markdown>{currentPlan.attributes.prompts || ""}</Markdown>
              )}
              {editPrompts && (
                <form onSubmit={(e: any) => handleUpdate(e, { prompts: e.target.prompts.value })} style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
                  <MdEditor
                    name="prompts"
                    defaultValue={currentPlan.attributes.prompts || ""}
                    style={{ height: "auto", width: "100%" }}
                    renderHTML={(text) => <ReactMarkdown>{text || ""}</ReactMarkdown>}
                  />
                  <Button sx={{ mt: 1 }} onClick={() => setEditPrompts(false)} type="button" variant="outlined">Cancel</Button>
                  <Button sx={{ mt: 1, ml: 1 }} type="submit" variant="contained">Save</Button>
                </form>
              )}
            </div>
          </>)}
        </section>
        <Dialog open={showModal}>
          <Card sx={{ p: 4 }}>
            <div style={{ marginBottom: 24 }}>Are you sure you want to {modalMode} this plan?</div>
            <div>
              <Button style={{ width: 'calc(50% - 4px', marginRight: 8 }} variant="outlined" onClick={() => {
                setCurrentModalID(-1);
                setShowModal(false);
              }}>Cancel</Button>
              <Button style={{ width: 'calc(50% - 4px' }}  variant="contained" onClick={() => modalMode == "archive" ? handleArchive() : handleDelete()}>{modalMode === "archive" ? "Archive" : "Delete"}</Button>
            </div>
          </Card>
        </Dialog>
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
