const ENABLED = true

const log = (tag: string, message: string) => {
  if (ENABLED) {
    console.log(`tag: ${tag}, message: ${message}`)
  }
}

export default log
