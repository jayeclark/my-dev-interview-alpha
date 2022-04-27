import '../styles/globals.css'
import { ThemeProvider } from '@mui/material'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { theme } from '../styles/theme'


function MyApp({ Component, pageProps }: AppProps) {

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <style jsx>{`
        body {
          background-color: ${theme.palette.common.black}
          color: ${theme.palette.common.white}
        }
      `}</style>
    </ThemeProvider>)
}

export default MyApp
