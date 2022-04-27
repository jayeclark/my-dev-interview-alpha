import AWS from "aws-sdk"

const AWSConfig = {
  accessKeyId: "AKIAX4F5XTNRJGOGN7UT",
  secretAccessKey: "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",
}
AWS.config.update(AWSConfig);
export const s3 = new AWS.S3()

export function uploadToS3(file: File) {
  return s3.putObject({ 
    Bucket: 'mydevinterview-videos',
    Key: file.name,
    Body: file
  }).promise()
}