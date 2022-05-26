import { useState } from "react" 
import Image from "next/image"
import { useRouter } from "next/router"
import { Button, useTheme } from "@mui/material"
import hero from "../assets/interview.jpg"
import arrow from "../assets/arrow-right-short.svg"
import video from "../assets/video.png"
import SignInForm from "./SignInForm"

const plan = (<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
</svg>)

const record = (<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
</svg>)

const share = (<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16">
  <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
</svg>)

export default function LandingPage() {
  const theme = useTheme();
  const router = useRouter();
  
  const [showSignIn, setShowSignIn] = useState(false);
  const handleShowSignin = (bool: boolean) => {
    setShowSignIn(bool);
  }

  return (
    <>
      <div className="hero">
        <Image src={hero} alt="video interview" />
        <div className="landing">
          
        </div>
        <div className="cta">
          <h1>Ace the virtual tech interview</h1>
          <p>Plan, practice and receive feedback on your video answers to behavioral and technical interview questions from top employers.</p>
          <div>
            <Button variant="contained" color="info" sx={{ mr: 2 }} onClick={() => setShowSignIn(true)}>Get Started</Button><Button onClick={() => router.push("/practice")} variant="outlined" color="info" >Try it Out</Button>
          </div>
        </div>
      </div>
      <div>
        <h1 className="steps-title">How MyDevInterview Works</h1>
        <div className="steps">
          <div className="step">
            <div className="icon">{plan}</div>
            <h3>Plan answers</h3>
          </div>
          <div className="arrow">
            <Image src={arrow} width={40} height={40} alt="right arrow"/>
            <h3>&nbsp;</h3>
          </div>
          <div className="step">
            <div className="icon">{record}</div>
            <h3>Record videos</h3>
          </div>
          <div className="arrow">
            <Image src={arrow} width={40} height={40} alt="right arrow"/>
            <h3>&nbsp;</h3>
          </div>
          <div className="step">
            <div className="icon">{share}</div>
            <h3>Share for feedback</h3>
          </div>
        </div>
        <div className="steps-cta">
          <Button onClick={() => setShowSignIn(true)} size="large" sx={{ width: "30vw", minWidth: "200px", mr: 2 }} variant="contained" color="primary" >Get Started</Button>
        </div>
      </div>
      <div className="features">
        <div>
          <Image src={video} alt="video call" width={540} height={360} />
        </div> 
        <div>
          <h2>Features</h2>
          <div style={{ width: "max-content" }}>
            <ul style={{ paddingLeft: 16 }}>
              <li style={{ paddingBottom: 8 }}>Search &amp; filter hundreds of questions</li>
              <li style={{ paddingBottom: 8 }}>Plan STAR, CARL, or SOAR responses</li>
              <li style={{ paddingBottom: 8 }}>Practice, rate and save video responses</li>
              <li style={{ paddingBottom: 8 }}>Share responses with friends and mentors</li>
              <li style={{ paddingBottom: 8 }}>Use social feedback to improve your performance</li>
            </ul>
          </div>
          
        </div>
      </div>
      <SignInForm signUpMode={true} showSignIn={showSignIn} setShowSignIn={handleShowSignin} />
      <style jsx>{`
      .icon {
        box-shadow: 1px 1px 4px rgba(0,0,0,0.1);
        padding: 25px 25px 22px 25px;
        border-radius: 80px;
        background-color: #fff;
        width: 100px;
        height: 100px;
        color: ${theme.palette.primary.main};
      }
      .steps-title {
        text-align: center;
      }
      .cta h1 {
        margin-bottom: ${theme.spacing(1)}
        text-align: left;
      }
      p {
        margin-top: 0;
        padding-bottom: ${theme.spacing(2)};
      }
      .hero {
        margin: -20px -3rem 20px -3rem;
        position: relative;
        overflow: hidden;
      }
      .landing {
        position: absolute;
        width: 75vw;
        height: 75vw;
        border-radius: 50vw;
        top: -20vw;
        left: -15vw;
        background-color: ${theme.palette.primary.main}
      }
      .cta {
        position: absolute;
        top: 0;
        padding: 40px;
        height: 50vw;
        width: 55vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #fff;
      }
      .steps {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        margin-bottom: 32px;
      }
      .steps-cta {
        text-align: center;
        margin-bottom: 48px;
      }
      .step {
        width: 20vw;
        height: 20vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .arrow {
        width: 5vw;
        text-align: center;
      }
      .features {
        background-color: ${theme.palette.primary.main};
        width: 100vw;
        text-align: center;
        padding: 40px 40px 40px 0px;
        color: #fff;
        display: flex;
        justify-content: stretch;
        align-items: center;
      }
      .features div {
        flex-grow: 1;
        text-align: left;
      }
      `}</style>
    </>
  )
}