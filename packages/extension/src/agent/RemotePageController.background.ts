/**
 * background logics for RemotePageController
 * - redirect messages from RemotePageController(Agent, extension pages) to ContentScript
 */

export function handlePageControlMessage(
	message: { type: 'PAGE_CONTROL'; action: string; payload: any; targetTabId: number },
	sender: chrome.runtime.MessageSender,
	sendResponse: (response: unknown) => void
): true | undefined {
	const PREFIX = '[RemotePageController.background]'

	const debug = console.debug.bind(console, `\x1b[90m${PREFIX}\x1b[0m`)

	const { action, payload, targetTabId } = message

	if (action === 'get_my_tab_id') {
		debug('get_my_tab_id', sender.tab?.id)
		sendResponse({ tabId: sender.tab?.id || null })
		return
	}

	if (action === 'capture_screenshot') {
		// captureVisibleTab is a background/extension API — handle it here, do NOT
		// forward to the content script. Look up the tab's window first.
		chrome.tabs
			.get(targetTabId)
			.then((tab) => chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 60 }))
			.then((dataUrl) => {
				sendResponse({ success: true, dataUrl })
			})
			.catch((error) => {
				console.error(PREFIX, 'capture_screenshot', error)
				sendResponse({ success: false, dataUrl: null })
			})
		return true // async response
	}

	// proxy to content script
	chrome.tabs
		.sendMessage(targetTabId, {
			type: 'PAGE_CONTROL',
			action,
			payload,
		})
		.then((result) => {
			sendResponse(result)
		})
		.catch((error) => {
			console.error(PREFIX, error)
			sendResponse({
				success: false,
				error: error instanceof Error ? error.message : String(error),
			})
		})

	return true // async response
}
