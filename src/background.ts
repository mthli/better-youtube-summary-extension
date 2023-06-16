import { Message, MessageType } from './data'
import log from './log'

const TAG = 'background'

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  // log(TAG, `onMessage, sender=${sender.id}, message=${JSON.stringify(message)}`)

  // Filter our extension messages.
  if (sender.id !== chrome.runtime.id) {
    const msg = `invalid sender, sender=${sender.id}`
    log(TAG, msg)

    sendResponse({
      type: MessageType.ERROR,
      error: new Error(msg),
    } as Message)

    return true
  }

  const { type, requestUrl, requestInit } = message
  if (type !== MessageType.REQUEST || !requestUrl) {
    const msg = `invalid request, message=${JSON.stringify(message)}`
    log(TAG, msg)

    sendResponse({
      type: MessageType.ERROR,
      error: new Error(msg),
    } as Message)

    return true
  }

  fetch(requestUrl, requestInit)
    .then(async (response: Response) => { // response can't be stringify.
      sendResponse({
        type: MessageType.RESPONSE,
        responseOk: response.ok,
        responseJson: await response.json(),
      } as Message)
    })
    .catch((error: Error) => { // error can't be stringify.
      sendResponse({
        type: MessageType.ERROR,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      } as Message)
    })
    .finally(() => {
      // DO NOTHING.
    })

  // https://stackoverflow.com/q/48107746
  return true
})
