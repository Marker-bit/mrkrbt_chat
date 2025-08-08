export type Tools = {
  generateImage: {
    input: {
      prompt: string
    },
    output: {
      message: string
    } | {
      error: string
    } | {
      image: string
    }
  },
  webSearch: {
    input: {
      query: string
    },
    output: {
      title: string | null
      url: string
      content: string
      publishedDate: string | undefined
    }[]
  }
}