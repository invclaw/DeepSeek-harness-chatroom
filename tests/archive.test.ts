import { describe, expect, it } from 'vitest'
import { openChatArchive } from '../src/archive.js'

describe('ChatArchive', () => {
  it('projects messages, resolves ownership, and records recall model ids', async () => {
    const archive = await openChatArchive(':memory:')
    archive.upsertConversation({
      id: 'room-1',
      kind: 'room',
      title: '测试群',
      sessionId: 'session-1',
      createdAt: 1,
      updatedAt: 1,
    })
    archive.upsertMember('room-1', 'alice', 'Alice', 1)
    archive.upsertMessage({
      conversationId: 'room-1',
      id: 'user:7',
      sequence: 7,
      role: 'human',
      senderId: 'alice',
      displayName: 'Alice',
      text: '需要撤回',
      createdAt: 2,
      sessionId: 'session-1',
      sessionSeq: 7,
      modelMessageId: 'model-message-7',
    })

    expect(archive.messageOwner('room-1', 'steering:7', 'session-1')).toEqual({
      senderId: 'alice',
      modelMessageId: 'model-message-7',
    })
    archive.recallMessage('room-1', 'steering:7', 'alice', 3, 'session-1')
    expect(archive.recalledMessageIds('session-1')).toEqual(new Set(['model-message-7']))
    archive.close()
  })

  it('stores attachment bytes by content hash and reads them through opaque keys', async () => {
    const archive = await openChatArchive(':memory:')
    const data = new TextEncoder().encode('same attachment')
    const first = await archive.putAttachment({
      id: 'file-1',
      roomId: 'room-1',
      participantId: 'alice',
      displayName: 'Alice',
      name: 'note.txt',
      mediaType: 'text/plain',
      bytes: data.byteLength,
      createdAt: 1,
    }, data)
    const second = await archive.putBlob(data)

    expect(second).toEqual(first)
    expect(new TextDecoder().decode(archive.readBlob(first.storageKey))).toBe('same attachment')
    expect(() => archive.readBlob('../chatroom.sqlite')).toThrow('invalid chatroom blob key')
    archive.close()
  })

  it('persists meeting lifecycle state for status cards and external summary consumers', async () => {
    const archive = await openChatArchive(':memory:')
    archive.upsertMeeting({
      id: 'public-meeting',
      conversationKind: 'room',
      conversationId: 'room-1',
      externalMeetingId: 'provider-secret',
      title: '周会',
      status: 'init',
      summaryStatus: 'pending',
      createdAt: 1,
      updatedAt: 1,
    })
    expect(archive.pendingMeetings()).toHaveLength(1)
    archive.upsertMeeting({
      ...archive.meeting('public-meeting')!,
      status: 'end',
      summaryStatus: 'completed',
      summary: '结论',
      endedAt: 2,
      summaryPostedAt: 3,
      updatedAt: 3,
    })
    expect(archive.meetingSummaries()).toMatchObject([{ id: 'public-meeting', summary: '结论' }])
    expect(archive.pendingMeetings()).toHaveLength(0)
    archive.close()
  })
})
