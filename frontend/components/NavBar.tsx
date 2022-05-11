import { useState, useContext, useEffect, useRef, MutableRefObject } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useTheme } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import axios from 'axios'
import { authorizationUrl } from "../scripts/config"
import { UserContext } from "../scripts/context"
import Google from "../assets/google.svg"
import Github from "../assets/github.png"
import EyeFill from "../assets/eye-fill.svg"
import EyeFillSlash from "../assets/eye-slash-fill.svg"
import Close from "../assets/x-lg.svg"
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
  const [ signup, setSignup ] = useState(false);
  const [ showPassword, setShowPassword ] = useState(false);
  const [ showConfirm, setShowConfirm ] = useState(false);
  
  var g_windowReference: Window | null = null;
  let oldHref: MutableRefObject<any> = useRef(null);

  useEffect(() => {
    oldHref.current = document.location.href
  }, [])

  const closeGooglePopUp = () => {
    if ( g_windowReference !== null && g_windowReference.closed == false)
    {
        g_windowReference.close();
        g_windowReference = null;
    }
  }

  const openGooglePopUp = () => {
    closeGooglePopUp();
    g_windowReference = window.open(authorizationUrl,'targetWindow',
                                 `toolbar=no,
                                    location=no,
                                    status=no,
                                    menubar=no,
                                    scrollbars=yes,
                                    resizable=yes,
                                    width=500,
                                    height=800`);
    if (g_windowReference && document) {
      g_windowReference.onload = () => {
        const bodyList = document.querySelector('body');
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (oldHref.current != document.location.href) {
              oldHref.current = document.location.href
            }
            if (oldHref.current.includes("google") == false) {
              closeGooglePopUp();
              router.push("/")
            }
          })
        })
        const config = {
          childList: true,
          subtree: true
        };
        
        observer.observe(bodyList as Node, config);
      }
    }
    return false;
  }

  const createUser = async ({ email, password }: { email: string; password: string}) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = "http://localhost:1337/api/auth/local/register"
    const body = {
      username: email, 
      email: email,
      password: password
    }
    console.log('body')
    console.log(body);
    return new Promise((resolve, reject) => {
      try {
        axios.post(url, body).then(response => {
          console.log(response.data);
          
          handleSetUser({
            email: response.data.user.email,
            jwt: response.data.jwt,
            username: response.data.user.username,
            id: response.data.user.id
          })
          setShowSignIn(false);
          setSignup(false);
          resolve(response);
        })
      } catch (e) {
        console.log(e)
        reject(e);
      }
    })

  }

  const isActive = (path: string) => {
    return router.pathname === path;
  }

  const authUser = async ({ email, password }: { email: string; password: string}) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = "http://localhost:1337/api/auth/local"
    const body = {
      identifier: email, 
      password: password
    }
    console.log('body')
    console.log(body);
    return new Promise((resolve, reject) => {
      try {
        axios.post(url, body).then(response => {
          console.log(response.data);
          
          handleSetUser({
            email: response.data.user.email,
            jwt: response.data.jwt,
            username: response.data.user.username,
            id: response.data.user.id
          })
          setShowSignIn(false);
          setSignup(false);
          resolve(response);
        })
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  const logout = () => {
    localStorage.setItem("jwt", "");
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
      <Dialog open={showSignIn}>
        <Box sx={{ p: 2 }}>
          <div style={{ paddingBottom: 16, cursor: 'pointer', textAlign: 'right', fontWeight: '600' }} onClick={() => setShowSignIn(false)}>
            <Image src={Close} alt="close sign in dialog" />
          </div>
          <Button variant="google" size="large" style={{ marginBottom: 16, width: "100%"}} onClick={openGooglePopUp}>
            <Image height="24" width="24" src={Google} alt="Google Logo"/>
            <span style={{ marginLeft: 8 }}>Sign in with Google</span>
          </Button>
          <Button variant="github" size="large" style={{ marginBottom: 16, width: "100%"}}>
            <Image height="24" width="24" src={Github} alt="GitHub Logo" />
            <span style={{ marginLeft: 8 }}>Sign in with GitHub</span>
          </Button>
          <hr />
          <form style={{ marginTop: 24 }} onSubmit={(e) => {
            e.preventDefault();
            if (signup) {
              const form = e.target as HTMLFormElement;
              console.log(form.email.value, form.password.value);
              createUser({ email: form.email.value, password: form.password.value })
            } else {
              const form = e.target as HTMLFormElement;
              authUser({ email: form.email.value, password: form.password.value })
            }

          }}>
            <TextField id="email" type="text" label="Email" name="email" fullWidth sx={{ mb: 2 }} />
            <div style={{ position: 'relative' }}>
              <TextField id="password" type={showPassword ? "text" : "password"} label="Password" name="password"  fullWidth  sx={{ mb: 2 }} />
              <div style={{ position: 'absolute', top: 20, right: 16 }} onClick={() => setShowPassword(!showPassword)}>
                <Image style={{ cursor: 'pointer', color: 'inherit' }} src={showPassword ? EyeFillSlash : EyeFill} alt={showPassword ? "Hide Password" : "Show Password"}/>
              </div>
            </div>
            {signup && (
              <div style={{ position: 'relative' }}>
                <TextField id="password2" type={showConfirm ? "text" : "password"} label="Confirm Password" name="password2"  fullWidth sx={{ mb: 2 }} />
                <div style={{ position: 'absolute', top: 20, right: 16 }} onClick={() => setShowConfirm(!showConfirm)}>
                  <Image style={{ cursor: 'pointer', color: 'inherit' }} src={showConfirm ? EyeFillSlash : EyeFill} alt={showPassword ? "Hide Password Confirmation" : "Show Password Confirmation"}/>
                </div>
              </div>
            )}
            <Button variant="contained" size="large" style={{ width: '100%'}} type="submit">
              {signup ? "Sign Up with Email" : "Sign In with Email"}
            </Button>
            {!signup && (
              <div style={{ paddingTop: 16 }}>Need an account? <span onClick={() => setSignup(true)} style={{ color: theme.palette.primary.main, cursor: 'pointer' }}>Register here</span></div>
            )}
            {signup && (
              <div style={{ paddingTop: 16 }}>Already have an account? <span onClick={() => setSignup(false)} style={{ color: theme.palette.primary.main, cursor: 'pointer' }}>Sign in here</span></div>
            )}
            </form>
        </Box>
      </Dialog>
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