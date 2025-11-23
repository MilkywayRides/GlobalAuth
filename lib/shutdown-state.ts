// Simple in-memory shutdown state
let shutdownActive = false;

export function setShutdownState(active: boolean) {
  shutdownActive = active;
}

export function getShutdownState(): boolean {
  return shutdownActive;
}
