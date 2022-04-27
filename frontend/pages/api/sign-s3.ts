// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import AWS from "aws-sdk"
import formidable from "formidable"
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false
  }
}

const AWSConfig = {
  accessKeyId: "AKIAX4F5XTNRJGOGN7UT",
  secretAccessKey: "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",
}
AWS.config.update(AWSConfig);
const s3 = new AWS.S3()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  let parsedFiles;
  const data: any = await new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      console.log('parsed');
      console.log(files);
      parsedFiles = files;
      console.log(fields);
      console.log(err);
      if (err) reject({ err })
      resolve({ err, fields, files })
    })
  })
  
  console.log(data);
  const file = await data.files.file;
  const { id } = req.query;
  const timestamp = new Date(Date.now()).getTime();
  const key = id + "-" + timestamp + ".mp4";

  try {
    const response = await s3.putObject({ 
      Bucket: 'mydevinterview-videos',
      Key: key,
      Body: fs.createReadStream(file.filepath),
      ContentType: 'audio/mpeg'
    }).promise()
    console.log('sent')
    res.send({ response, filename: key });
  } catch (e) {
    console.log(e);
  }

}
