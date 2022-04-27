export const getQuestionIDs = `
query getQuestionIDs($num: Int) {
  questions(pagination: { start: $num, limit: 1000}) {
    data {
      id
    }
  }
}
`

export const getQuestion = `
query getQuestion($id: ID) {
  question(id: $id) {
    data {
      id
      attributes {
        question
        category
      }
    }
  }
}
`

export const getVideos = `
query getVideos($id: Long) {
  answers(filters: { user_id: { eq: $id }}, pagination: { start: 0, limit: 1000 }) {
    data {
      id
      attributes {
        rating
        s3key
        datetime
        question {
          data {
            id
            attributes {
              question
              category
            }
          }
        }
      }
    }
  }
}
`