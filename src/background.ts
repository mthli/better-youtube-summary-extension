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

// https://github.com/Azure/fetch-event-source
class FatalError extends Error { }
class RetriableError extends Error { }

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
  // log(TAG, `onMessage, senderId=${sender.id}, message=${JSON.stringify(message)}`)

  // Filter our extension messages.
  if (sender.id !== chrome.runtime.id) {
    throwInvalidSender(sendResponse, sender.id)
    return true
  }

  // Must be MessageType.REQUEST
  const { type, requestUrl, requestInit } = message
  if (type !== MessageType.REQUEST || !requestUrl) {
    throwInvalidRequest(sendResponse, message)
    return true
  }

  fetch(requestUrl, requestInit)
    .then(async (response: Response) => { // response can't be stringify.
      const json = await response.json()
      log(TAG, `then, ok=${response.ok}, json=${JSON.stringify(json)}`)
      sendResponse({
        type: MessageType.RESPONSE,
        responseOk: response.ok,
        responseJson: json,
      } as Message)
    })
    .catch((error: Error) => { // error can't be stringify.
      log(TAG, `catch, error=${error}`)
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
    log(TAG, `onMessage, port=${port}, message=${JSON.stringify(message)}`)

    // Filter our extension messages.
    if (senderId !== chrome.runtime.id) {
      throwInvalidSender(port.postMessage, senderId)
      return true
    }

    // Must be MessageType.REQUEST
    const { type, requestUrl, requestInit = {} } = message
    if (type !== MessageType.REQUEST || !requestUrl) {
      throwInvalidRequest(port.postMessage, message)
      return true
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    const ctrl = new AbortController()

    // https://github.com/Azure/fetch-event-source
    const init: FetchEventSourceInit = {
      ...requestInit,
      signal: ctrl.signal,

      async onopen(response: Response) {
        const { ok, headers, status } = response
        const contentType = headers.get('Content-Type')
        if (ok) {
          if (contentType === EventStreamContentType) {
            return // continue to onmessage, onclose or onerror.
          } else if (contentType === APPLICATION_JSON) {
            const json = await response.json()
            log(TAG, `onopen, json=${JSON.stringify(json)}`)

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
        log(TAG, `onerror, port=${name}, error=${error}`)

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
        log(TAG, `onclose, port=${name}`)

        port.postMessage({
          type: MessageType.SSE,
          sseEvent: SseEvent.CLOSE,
        } as Message)

        port.disconnect()
      },

      onmessage(event: EventSourceMessage) {
        try {
          const { event: sseEvent, data } = event
          const sseData = JSON.parse(data)
          log(TAG, `onmessage, event=${JSON.stringify(event)}`)

          port.postMessage({
            type: MessageType.SSE,
            sseEvent: sseEvent as SseEvent,
            sseData: sseData,
          } as Message)
        } catch (e) {
          log(TAG, `onmessage, event=${JSON.stringify(event)}, error=${e}`)
          // DO NOTHING.
        }
      },
    }

    fetchEventSource(requestUrl, init)
    return true
  })
})
