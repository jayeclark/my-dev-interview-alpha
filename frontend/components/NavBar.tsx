import { useState, useContext, useEffect, useRef, MutableRefObject } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useTheme } from "@mui/material"
import SignInForm from "./SignInForm"
import { UserContext } from "../scripts/context"
import mdi from "../assets/mdi.png"
import profile from "../assets/profile_small.jpg"
import practice from "../assets/camera-video-fill.svg"
import review from "../assets/video.svg"
import plan from "../assets/list-check.svg"
import share from "../assets/share-fill.svg"
import down from "../assets/caret-down-fill.svg"

function NavBar() {
  const theme = useTheme();
  const router = useRouter();
  const { handleSetUser, user } = useContext(UserContext);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activePage, setActivePage] = useState(router.pathname)

  const handleSetShowSignIn = (visible: boolean) => {
    setShowSignIn(visible);
  }

  const logout = () => {
    localStorage.removeItem("mdi-session-access-token")
    handleSetUser({
      email: '',
      jwt: ''
    })
    router.push("/");
  }

  return (
    <>
      <nav className="navigation">
        <div className="brand">
          <Image height="41" width="64" alt="logo" src={mdi} />
        </div>
        <div style={{ margin: "-8px 0px", height: "calc(100% + 16px)", display: 'flex', alignItems: "center" , minHeight: "100%" }}>
        {user.jwt !== '' && (
            <div className={activePage == "/plan" ? "nav-item-active" : "nav-item"}>
            <Link href="/plan" passHref>
                <div className="nav-link">
                  <div style={{ overflow: "hidden", display: "flex", maxHeight: "20px", alignItems: "center"}}>
                    <Image width="24" height="24" src={plan} alt="plan" />
                  </div>
                <div style={{ paddingTop: 2 }}>Plan</div>
              </div>
            </Link>
          </div>)}
          <div className={activePage == "/" ? "nav-item-active" : "nav-item"}>
            <Link href="/" passHref>
              <div className="nav-link">
                <div style={{ justifyContent: "center", overflow: "hidden", display: "flex", maxHeight: "20px", alignItems: "center"}}> 
                  <Image width="24" height="24" style={{ margin: "-3px 0px" }} src={practice} alt="practice" />
                </div>
                <div style={{ paddingTop: 2 }}>Practice</div>
              </div>
            </Link>
          </div>
          {user.jwt !== '' && (
            <div className={activePage == "/review" ? "nav-item-active" : "nav-item"}>
              <Link href="/review" passHref>
                <div className="nav-link">
                  <Image width="18" height="18" src={review} alt="review" />
                  <div style={{ paddingTop: 2 }}>Review</div>
                </div>
              </Link>
            </div>)}
          {user.jwt !== '' && (
            <div className={activePage == "/share" ? "nav-item-active" : "nav-item"}>
              <Link href="/share" passHref>
                <div className="nav-link">
                  <Image width="18" height="18" src={share} alt="share" />
                  <div style={{ paddingTop: 2 }}>Share</div>
                </div>
              </Link>
            </div>)}
          {user.jwt === '' && (
            <div className="nav-item sign-in" onClick={() => setShowSignIn(true)}>
              Sign In
            </div>)}
          {user.jwt !== '' && (
            <div className="nav-item profile" style={{ marginTop: "-3px" }}>
              <div className="nav-link" style={{ paddingTop: 8 }}>
                <div onClick={logout}><Image alt="profile" width="24" height="24" style={{ opacity: "1!important", border: "1px solid #dce6f1", borderRadius: 41 }} src={profile} /></div>
                <div className="nav-label" style={{ marginTop: -4 }}>Me<Image width="16" height="16" style={{ marginTop: 4, opacity: 0.7 }} src={down} alt="dropdown" />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <SignInForm showSignIn={showSignIn} setShowSignIn={handleSetShowSignIn} />
      <style jsx>{`
        .navigation {
          width: 100vw;
          height: 57px;
          min-height: 45px;
          max-height: 57px;
          padding: 8px 16px;
          position: fixed;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0px 1px 1px #dce6f1;
          top: 0;
          left: 0;
          color: #000;
          background-color: ${theme.palette.background.paper};
        }
        .brand {
          margin: auto 0;
          padding: 0 8px;
          font-size: 1.35rem;
          font-weight: 600;
        }
        .sign-in {
          cursor: pointer;
        }
        .nav-item-active,
        .nav-item:hover {
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          margin-left: 24px;
          opacity: 1;
          height: 100%;
        }
        .nav-item {
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          margin-left: 24px;
          opacity: 0.6;
          height: 100%;
        }
        .nav-item.profile {
          opacity: 1;
        }
        .nav-label {
          opacity: 0.6;
        }
        .nav-label:hover {
          opacity: 1;
        }
        .nav-link {
          padding: 10px 8px 0px 8px;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.75px;
          height: 100%;
        }
        .nav-item-active .nav-link {
          border-bottom: 2px solid;
        }
        .nav-item .nav-link {
          border-bottom: 2px solid transparent;
        }
      `}</style>
    </>
  );
}

export default NavBar