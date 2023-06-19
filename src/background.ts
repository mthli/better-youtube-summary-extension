import {
  EventStreamContentType,
  EventSourceMessage,
  FetchEventSourceInit,
  fetchEventSource,
} from '@microsoft/fetch-event-source'

import { APPLICATION_JSON } from './api'
import { Message, MessageType, SseEvent } from './data'
import log from './log'

const TAG = 'background'

// Server worker `document` is undefined,
// but `fetchEventSource` need it,
// so we mock it.
//
// @ts-ignore
global.document = {
  hidden: false,

  // @ts-ignore
  addEventListener: (type, listener, options) => {
    try {
      global.addEventListener(type, listener, options)
    } catch (e) {
      log(TAG, `addEventListener catch, type=${type}, e=${e}`)
      // DO NOTHING.
    }
  },

  // @ts-ignore
  removeEventListener: (type, listener, options) => {
    try {
      global.removeEventListener(type, listener, options)
    } catch (e) {
      log(TAG, `removeEventListener catch, type=${type}, e=${e}`)
      // DO NOTHING.
    }
  },
}

// Server worker `document` is undefined,
// but `fetchEventSource` need it,
// so we mock it.
//
// @ts-ignore
global.window = {
  // @ts-ignore
  setTimeout: (callback, ms, ...args) => {
    try {
      global.setTimeout(callback, ms, args)
    } catch (e) {
      log(TAG, `setTimeout catch, e=${e}`)
      // DO NOTHING.
    }
  },

  clearTimeout: timeoutId => {
    try {
      global.clearTimeout(timeoutId)
    } catch (e) {
      log(TAG, `clearTimeout catch, e=${e}`)
      // DO NOTHING.
    }
  },
}

// https://github.com/Azure/fetch-event-source
class FatalError extends Error { /* DO NOTHING. */ }
class RetriableError extends Error { /* DO NOTHING. */ }

const throwInvalidSender = (send: (message?: any) => void, senderId?: string) => {
  const msg = `invalid sender, senderId=${senderId}`
  log(TAG, msg)
  send({
    type: MessageType.ERROR,
    error: new Error(msg),
  } as Message)
}

const throwInvalidRequest = (send: (message?: any) => void, message: Message) => {
  const msg = `invalid request, message=${JSON.stringify(message)}`
  log(TAG, msg)
  send({
    type: MessageType.ERROR,
    error: new Error(msg),
  } as Message)
}

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  log(TAG, `runtime onMessage, senderId=${sender.id}`)

  // Filter our extension messages.
  if (sender.id !== chrome.runtime.id) {
    throwInvalidSender(sendResponse, sender.id)
    return true
  }

  const { type, requestUrl, requestInit } = message
  log(TAG, `runtime onMessage, requestUrl=${requestUrl}`)

  // Must be MessageType.REQUEST
  if (type !== MessageType.REQUEST || !requestUrl) {
    throwInvalidRequest(sendResponse, message)
    return true
  }

  // https://stackoverflow.com/a/62461987
  if (requestUrl.startsWith('chrome-extension://')) {
    chrome.tabs.create({ url: requestUrl })
    sendResponse({
      type: MessageType.RESPONSE,
      responseOk: true,
    } as Message)
    return true
  }

  fetch(requestUrl, requestInit)
    .then(async (response: Response) => { // response can't be stringify.
      const json = await response.json()
      log(TAG, `fetch then, ok=${response.ok}, json=${JSON.stringify(json)}`)
      sendResponse({
        type: MessageType.RESPONSE,
        responseOk: response.ok,
        responseJson: json,
      } as Message)
    })
    .catch((error: Error) => { // error can't be stringify.
      log(TAG, `fetch catch, error=${error}`)
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

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((message, port) => {
    const { name, sender: { id: senderId } = {} } = port
    log(TAG, `port onMessage, port=${name}`)

    // Filter our extension messages.
    if (senderId !== chrome.runtime.id) {
      throwInvalidSender(port.postMessage, senderId)
      port.disconnect()
      return true
    }

    // Must be MessageType.REQUEST
    const { type, requestUrl, requestInit = {} } = message
    if (type !== MessageType.REQUEST || !requestUrl) {
      throwInvalidRequest(port.postMessage, message)
      port.disconnect()
      return true
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    const ctrl = new AbortController()

    // https://github.com/Azure/fetch-event-source
    const init: FetchEventSourceInit = {
      ...requestInit,

      openWhenHidden: true,
      signal: ctrl.signal,
      fetch: fetch,

      async onopen(response: Response) {
        const { ok, headers, status } = response
        const contentType = headers.get('Content-Type')
        if (ok) {
          if (contentType === EventStreamContentType) {
            return // continue to onmessage, onclose or onerror.
          } else if (contentType === APPLICATION_JSON) {
            const json = await response.json()
            log(TAG, `sse onopen, json=${JSON.stringify(json)}`)

            port.postMessage({
              type: MessageType.RESPONSE,
              responseOk: ok,
              responseJson: json,
            } as Message)

            port.disconnect()
            ctrl.abort() // finished.
            return
          } else {
            const msg = `onopen, invalid response, contentType=${contentType}`
            throw new FatalError(msg)
          }
        } else if (status >= 400 && status < 500 && status !== 429) {
          const msg = `onopen, invalid response, status=${status}`
          throw new FatalError(msg)
        } else {
          const msg = `onopen, invalid response, status=${status}`
          throw new RetriableError(msg)
        }
      },

      onerror(error: Error) { // error can't be stringify.
        log(TAG, `sse onerror, port=${name}, error=${error}`)

        // If this callback is not specified, or it returns undefined,
        // will treat every error as retriable and will try again after 1 second.
        if (error instanceof RetriableError) return

        port.postMessage({
          type: MessageType.ERROR,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        } as Message)

        port.disconnect()

        // If the error is fatal,
        // rethrow the error inside the callback to stop the entire operation.
        throw error
      },

      onclose() {
        log(TAG, `sse onclose, port=${name}`)
        port.disconnect()
      },

      onmessage(event: EventSourceMessage) {
        try {
          const { event: sseEvent, data } = event
          const sseData = JSON.parse(data)
          log(TAG, `sse onmessage, port=${name}, event=${sseEvent}, data=${data}`)

          switch (sseEvent) {
            case SseEvent.SUMMARY:
              port.postMessage({
                type: MessageType.SSE,
                sseEvent: SseEvent.SUMMARY,
                sseData: sseData,
              } as Message)
              break
            case SseEvent.CLOSE:
              port.disconnect()
              break
            default:
              // DO NOTHING.
              break
          }
        } catch (e) {
          log(TAG, `see onmessage, port=${name}, error=${e}`)
          // DO NOTHING.
        }
      },
    }

    fetchEventSource(requestUrl, init)
    return true
  })
})
