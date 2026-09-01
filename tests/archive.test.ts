import { describe, expect, it } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { ChatArchive, openChatArchive } from '../src/archive.js'

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

  it('searches room, branch, and message text only for current members', async () => {
    const archive = await openChatArchive(':memory:')
    archive.upsertConversation({
      id: 'room-visible', kind: 'room', title: '灯塔研发群', sessionId: 'session-visible',
      createdAt: 1, updatedAt: 5,
    })
    archive.upsertConversation({
      id: 'thread-visible', kind: 'thread', title: '分支：发布检查', sessionId: 'session-thread',
      parentId: 'room-visible', createdAt: 2, updatedAt: 6,
    })
    archive.upsertConversation({
      id: 'room-hidden', kind: 'room', title: '灯塔保密群', sessionId: 'session-hidden',
      createdAt: 1, updatedAt: 7,
    })
    archive.upsertMember('room-visible', 'alice', 'Alice', 1)
    archive.upsertMember('room-hidden', 'bob', 'Bob', 1)
    archive.upsertMessage({
      conversationId: 'thread-visible', id: 'thread-message', sequence: 1, role: 'human',
      senderId: 'alice', displayName: 'Alice', text: '灯塔发布已经完成', createdAt: 8,
      sessionId: 'session-thread', sessionSeq: 9,
    })
    archive.upsertMessage({
      conversationId: 'room-hidden', id: 'hidden-message', sequence: 1, role: 'human',
      senderId: 'bob', displayName: 'Bob', text: '灯塔机密内容', createdAt: 9,
      sessionId: 'session-hidden', sessionSeq: 3,
    })

    expect(archive.search('alice', '灯塔')).toMatchObject([
      { kind: 'message', conversationId: 'thread-visible', messageId: 'user:9', text: '灯塔发布已经完成' },
      { kind: 'conversation', conversationId: 'room-visible', conversationTitle: '灯塔研发群' },
    ])
    expect(archive.search('alice', '发布检查')).toMatchObject([
      { kind: 'conversation', conversationId: 'thread-visible', conversationKind: 'thread' },
    ])
    expect(archive.search('alice', '机密')).toEqual([])
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
    expect(archive.meetingsByUrl('https://meeting.example.com/join')).toHaveLength(0)
    archive.upsertMeeting({
      ...archive.meeting('public-meeting')!,
      meetingUrl: 'https://meeting.example.com/join',
      status: 'end',
      summaryStatus: 'completed',
      summary: '结论',
      endedAt: 2,
      summaryPostedAt: 3,
      updatedAt: 3,
    })
    expect(archive.meetingSummaries()).toMatchObject([{ id: 'public-meeting', summary: '结论' }])
    expect(archive.meetingsByUrl('https://meeting.example.com/join')).toMatchObject([{ id: 'public-meeting' }])
    expect(archive.pendingMeetings()).toHaveLength(0)
    expect(archive.projectionMigrationComplete('meeting-cards-v1')).toBe(false)
    archive.completeProjectionMigration('meeting-cards-v1')
    expect(archive.projectionMigrationComplete('meeting-cards-v1')).toBe(true)

    archive.upsertMeeting({
      id: 'branch-meeting',
      conversationKind: 'thread',
      conversationId: 'thread-1',
      title: '分支会议',
      status: 'end',
      summaryStatus: 'completed',
      summary: '分支结论',
      createdAt: 4,
      updatedAt: 4,
    })
    expect(archive.pendingMeetings()).toMatchObject([{ id: 'branch-meeting', conversationKind: 'thread' }])
    archive.upsertMeeting({ ...archive.meeting('branch-meeting')!, summaryPostedAt: 5, updatedAt: 5 })
    expect(archive.pendingMeetings()).toHaveLength(0)
    archive.close()
  })

  it('migrates existing meeting rows before accepting branch meeting ownership', () => {
    const database = new DatabaseSync(':memory:')
    database.exec(`
      CREATE TABLE archive_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO archive_meta VALUES ('schema_version', '2');
      CREATE TABLE meetings (
        id TEXT PRIMARY KEY,
        conversation_kind TEXT NOT NULL CHECK(conversation_kind IN ('room', 'direct')),
        conversation_id TEXT NOT NULL,
        external_meeting_id TEXT,
        meeting_url TEXT,
        title TEXT NOT NULL,
        begin_time TEXT,
        end_time TEXT,
        status TEXT NOT NULL,
        summary_status TEXT NOT NULL CHECK(summary_status IN ('pending', 'completed', 'failed')),
        summary TEXT,
        summary_error TEXT,
        ended_at INTEGER,
        summary_posted_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      INSERT INTO meetings (id, conversation_kind, conversation_id, title, status, summary_status, created_at, updated_at)
        VALUES ('room-meeting', 'room', 'room-1', '旧会议', 'end', 'completed', 1, 1);
    `)

    const archive = new ChatArchive(database, undefined)
    archive.upsertMeeting({
      id: 'branch-meeting', conversationKind: 'thread', conversationId: 'thread-1', title: '分支会议',
      status: 'init', summaryStatus: 'pending', createdAt: 2, updatedAt: 2,
    })

    expect(archive.meeting('room-meeting')).toMatchObject({ conversationKind: 'room', title: '旧会议' })
    expect(archive.meeting('branch-meeting')).toMatchObject({ conversationKind: 'thread', title: '分支会议' })
    archive.close()
  })
})
