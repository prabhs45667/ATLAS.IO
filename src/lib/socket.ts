import type { Socket } from 'socket.io-client'

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (!socket) {
    const { io } = await import('socket.io-client')
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL
      || (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : 'http://localhost:3001')
    socket = io(serverUrl, { autoConnect: false })
  }
  return socket
}

export async function connectSocket(): Promise<Socket> {
  const s = await getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
