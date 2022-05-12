import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.url)
  console.log(req.query)
  //console.log(response);
  res.redirect("/authed")
}