import { describe, expect, it } from 'vitest'
import { branchLinkFromLocation, invitedRoomFromLocation } from '../src/client/branch-link.js'

describe('native branch deep links', () => {
  it('opens legacy branch URLs as a native main conversation', () => {
    const location = { search: '?dsh-chatroom-thread=thread&dsh-chatroom-thread-session=branch-session&dsh-chatroom-room=room&dsh-chatroom-parent-session=parent' }
    expect(branchLinkFromLocation(location)).toEqual({ threadId: 'thread', sessionId: 'branch-session', roomId: 'room', parentSessionId: 'parent' })
    expect(invitedRoomFromLocation(location, branchLinkFromLocation(location))).toBeUndefined()
  })
  it('ignores incomplete branch links and preserves room invitations', () => {
    const location = { search: '?dsh-chatroom-room=room&dsh-chatroom-thread=' }
    expect(branchLinkFromLocation(location)).toBeUndefined()
    expect(invitedRoomFromLocation(location, undefined)).toBe('room')
  })
})
