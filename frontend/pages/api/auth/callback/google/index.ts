import type { NextApiRequest, NextApiResponse } from 'next'
import { FRONTEND_URL } from '../../../../../scripts/config'
import { API_URL } from "../../../../index"

type Data = {
  status: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get auth token from Strapi
  const token = req.query.id_token
  const response = await fetch(`${API_URL}/api/auth/google/callback?access_token=${token}`)

  // Save the token locally

  res.send({ status: "OK" })
}