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

function NavBar() {
  const theme = useTheme();
  const router = useRouter();
  const { handleSetUser, user } = useContext(UserContext);
  const [ showSignIn, setShowSignIn ] = useState(false);

  const handleSetShowSignIn = (visible: boolean) => {
    setShowSignIn(visible);
  }
  const isActive = (path: string) => {
    return router.pathname === path;
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
        <div style={{ display: 'flex', alignItems: "center" }}>
        {user.jwt !== '' && (
          <div className="nav-item">
            <Link href="/plan" passHref>
              <div style={{ display: "flex", alignItems: "center", color: isActive("/") ? "#000" : "#666"}}>
                <Image width="24" height="24" style={{ color: isActive("/plan") ? "#000" : "#666"}} src={plan} alt="plan" />
                <div style={{ marginLeft: 8 }}>Plan</div>
              </div>
            </Link>
          </div>)}
          <div className="nav-item">
            <Link href="/" passHref>
              <div style={{ display: "flex", alignItems: "center", color: isActive("/") ? "#000" : "#666"}}>
                <Image width="24" height="24" style={{ color: isActive("/") ? "#000" : "#666"}} src={practice} alt="practice" />
                <div style={{ marginLeft: 8}}>Practice</div>
              </div>
            </Link>
          </div>
          {user.jwt !== '' && (
            <div className="nav-item">
              <Link href="/review" passHref>
                <div style={{ display: "flex", alignItems: "center", color: isActive("/") ? "#000" : "#666"}}>
                  <Image width="18" height="18" style={{ color: isActive("/review") ? "#000" : "#666"}} src={review} alt="review" />
                  <div style={{ marginLeft: 8}}>Review</div>
                </div>
              </Link>
            </div>)}
          {user.jwt === '' && (
            <div className="nav-item sign-in" onClick={() => setShowSignIn(true)}>
              Sign In
            </div>)}
          {user.jwt !== '' && (<div className="nav-item profile" onClick={logout}><Image alt="profile" width="32" height="32" style={{ border: "1px solid #dce6f1", borderRadius: 41}} src={profile}/></div>)}
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
          color: #666;
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
        .nav-item {
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          margin-left: 32px;
        }
      `}</style>
    </>
  );
}

export default NavBar