export function createAbortController() {
    const controller = new AbortController();
    return controller;
}

export function withAbortSignal(req) {
    const controller = createAbortController();
    req.on('close', () => controller.abort());
    return controller.signal;
}
