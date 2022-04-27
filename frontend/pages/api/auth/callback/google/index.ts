import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(Object.keys(req))
  console.log(req.url)
  console.log(req.statusCode)
  console.log(req.preview)
  console.log(req.query)
  res.redirect("/")
}