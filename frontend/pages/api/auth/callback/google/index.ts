import type { NextApiRequest, NextApiResponse } from 'next'
import { FRONTEND_URL } from '../../../../../scripts/config'

type Data = {
  status: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get auth token from google
  const data = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri:  `${FRONTEND_URL}/api/auth/callback/google`
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
  console.log(req.url)
  console.log(req.query)
  //console.log(response);
  //console.log(response.body);
  const token = await response.json()
  console.log('profile', token)
  res.send({ status: "OK" })
}