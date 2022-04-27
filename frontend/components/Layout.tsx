/* eslint-disable @next/next/no-page-custom-font */
import { useState } from "react";
import Head from "next/head";
import { useTheme } from "@mui/material";
import { Box } from "@mui/material";
import { UserContext } from "../scripts/context";
import NavBar from "./NavBar";

const Layout = (props: any) => {
  const theme = useTheme();

  const [ user, setuser ] = useState({ username: '', id: '', email: '', jwt: ''})

  const handleSetUser = (user: any) => {
    localStorage.setItem("jwt", user.jwt);
    setuser(user);
  }

  const title =
    "My Dev Interview - Video interview practice app";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="true"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </Head>
      <UserContext.Provider value={{ handleSetUser, user }}>
        <Box sx={{ background: theme.palette.background.default }}>
        <header>
          <style jsx>
            {`
              body {
                background-color: ${theme.palette.common.black}
                color: ${theme.palette.common.white}
              }
              h5 {
                color: #000;
                padding-top: 11px;
              }
              .navbar-brand {
                justify-self: left;
              }
            `}
          </style>
          <NavBar />
        </header>
        <div style={{ paddingTop: "70px" }}>{props.children}</div>
        </Box>
      </UserContext.Provider>
    </>
  );
};

export default Layout;