import { Button, useTheme } from "@mui/material"
import Link from "next/link"

export default function LandingPage({ username, id }: { username: string;  id: string}) {
  const theme = useTheme();

  return (
    <>
      <div>
        <h1 className="stats-title">Welcome, {username}!</h1>
        <div className="stats">
          <div className="stat">
            <div className="stat-number">12</div>
            <h3>answers planned</h3>
            <Link href="/plan" passHref>
            <Button 
              size="large" 
              sx={{ width: "100%", mt: 2, borderRadius: "50px" }} 
              variant="contained"
              color="info"
            >
              Plan an Answer
              </Button>
            </Link>
          </div>
          <div className="arrow">
            <h3>&nbsp;</h3>
          </div>
          <div className="stat">
            <div className="stat-number">5</div>
            <h3>saved videos</h3>
             <Link href="/practice" passHref>
              <Button size="large" sx={{ width: "100%", mt: 2, borderRadius: "50px" }} variant="contained" color="info" >Record a Video</Button>
            </Link>
          </div>
          <div className="arrow">
            <h3>&nbsp;</h3>
          </div>
          <div className="stat">
            <div className="stat-number">6</div>
            <h3>share links created</h3>
            <Link href="/share" passHref>
              <Button size="large" sx={{ width: "100%", mt: 2, borderRadius: "50px" }} variant="contained" color="info" >Share a Link</Button>
            </Link>
          </div>
        </div>
        <div className="steps-cta">
          </div>
      </div>
      <style jsx>{`
      .stat-number {
        padding: 0px 15px;
        border-radius: 80px;
        font-size: 3.5rem;
        font-weight: 500;
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${theme.palette.primary.main};
      }
      .stats-title {
        text-align: center;
        margin-top: 70px;
      }
      .cta h1 {
        margin-bottom: ${theme.spacing(1)}
        text-align: left;
      }
      p {
        margin-top: 0;
        padding-bottom: ${theme.spacing(2)};
      }
      .stats {
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
      .stat {
        width: 20vw;
        height: 20vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .stat h3 {
        margin-top: 0;
        color: ${theme.palette.primary.main}
      }
      .arrow {
        width: 5vw;
        text-align: center;
      }
      `}</style>
    </>
  )
}