import { Message, MessageType } from './data'
import log from './log'

const TAG = 'background'

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  log(TAG, `onMessage, message=${JSON.stringify(message)}, sender=${sender}`)

  // Filter our extension messages.
  if (sender.id !== chrome.runtime.id) return

  const { type, data: Request } = message
  if (type !== MessageType.REQUEST) return

  // TODO
})
