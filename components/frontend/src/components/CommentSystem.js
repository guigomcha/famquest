import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Avatar,
  Button,
  Space,
  Typography,
  Tooltip,
  message,
  Tabs,
  Input,
  List,
  Badge,
  Modal
} from 'antd';
import {
  SendOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  HeartOutlined,
  MessageOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { mockComments, mockMedia, mockUsers } from '../utils/mockData';

const { TextArea } = Input;
const { Text } = Typography;
const { TabPane } = Tabs;
const CommentSystem = ({ visible, onClose, event, onCommentAdded }) => {
  const { t } = useTranslation();

  /* ----------  state  ---------- */
  const [comments, setComments]         = useState([]);
  const [newComment, setNewComment]     = useState('');
  const [replyTo, setReplyTo]           = useState(null);
  const [isRecording, setIsRecording]   = useState(false);
  const [audioBlob, setAudioBlob]       = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playingAudios, setPlayingAudios] = useState(new Set());

  /* ----------  refs  ---------- */
  const audioRefs = useRef({});
  const mediaRecorderRef = useRef(null);

  /* ----------  helpers  ---------- */
  const formatTime = ts => new Date(ts).toLocaleString();

  const playAudio = id => {
    const el = audioRefs.current[id];
    if (!el) return;
    // TODO G: This returns an error but works...
    const n = new Set(playingAudios);
    n = n.has(id) ? (el.pause(), n.delete(id)) : (el.play(), n.add(id));
    setPlayingAudios(n);
  };

  const deleteComment = id =>
    setComments(prev => prev.filter(c => c.id !== id));

  const handleReply = parentId => {
    setReplyTo(parentId);
    setNewComment('');
  };

  /* ----------  comment block component (nested)  ---------- */
  const CommentBlock = ({ data, depth = 0 }) => {
    const isOwner = data.user?.id === 'user-1';
    const ml = depth * 32;
    // TODO: The avatars should appear aligned with the text (same row) and they should appear on the left before the text
    // TODO: Move the reply buttom to the right 
    return (
      <div style={{ marginLeft: ml, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(data.timestamp)}</Text>
          <Space>
            <Text strong style={{ fontSize: 13 }}>{data.user?.name}</Text>
            <Avatar size="small" src={data.avatar?.url} icon={!data.avatar && '👤'} />
          </Space>
        </div>

        <div style={{ marginTop: 4, paddingLeft: 4 }}>
          {data.text && <Text style={{ fontSize: 14 }}>{data.text}</Text>}

          {data.audioMedia && (
            <Space style={{ marginTop: 4 }}>
              <Button
                size="small"
                icon={playingAudios.has(data.id) ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => playAudio(data.id)}
              />
              <audio
                ref={el => (audioRefs.current[data.id] = el)}
                src={data.audioMedia.url}
                onEnded={() => setPlayingAudios(p => { const n = new Set(p); n.delete(data.id); return n; })}
              />
            </Space>
          )}

          <Space style={{ marginTop: 6 }}>
            {depth == 0 && (
              <Button type="link" size="small" onClick={() => handleReply(data.id)}>Reply</Button>

            )}
            {isOwner && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => deleteComment(data.id)}
              />
            )}
          </Space>
        </div>

        {data.replies?.map(r => (
          <CommentBlock key={r.id} data={r} depth={depth + 1} />
        ))}
      </div>
    );
  };

  /* ----------  load comments  ---------- */
  useEffect(() => {
    if (!visible) return;
    (async () => {
      await new Promise(r => setTimeout(r, 0));
      const hydrate = raw => {
        const usr = mockUsers.find(u => u.id === raw.user) || null;
        const av  = usr?.avatar ? mockMedia.find(m => m.id === usr.avatar) || null : null;
        return {
          ...raw,
          user: usr,
          avatar: av,
          audioMedia: raw.audio ? mockMedia.find(m => m.id === raw.audio) || null : null,
          replies: (raw.replies || [])
            .map(id => hydrate(mockComments.find(c => c.id === id)))
            .filter(Boolean)
        };
      };
      const top = (event.comments || [])
        .map(id => hydrate(mockComments.find(c => c.id === id)))
        .filter(Boolean)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setComments(top);
    })();
  }, [visible, event]);

  /* ----------  recording / submit stubs  ---------- */
  const startRecording = async () => { /* TODO */ };
  const stopRecording  = () => { /* TODO */ };
  const submitComment  = () => { /* TODO */ };

  /* ----------  render  ---------- */
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <Space>
          <MessageOutlined />
          <span>{t('comment.comments')}</span>
          {/* TODO: count also the replies for each one */}
          <Badge count={comments.length} showZero />
        </Space>
      }
    >
      {/* ---- input area ---- */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar src="resources/images/user1.png" />
          <div style={{ flex: 1 }}>
            <TextArea
              rows={2}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={replyTo ? 'Write a reply…' : t('comment.addComment')}
            />
            {audioBlob && (
              <Space style={{ marginTop: 6 }}>
                <Button size="small" icon={<PlayCircleOutlined />} onClick={() => new Audio(URL.createObjectURL(audioBlob)).play()} />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
                </Text>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => { setAudioBlob(null); setAudioDuration(0); }} />
              </Space>
            )}
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Space>
                <Button
                  size="small"
                  type={isRecording ? 'primary' : 'default'}
                  danger={isRecording}
                  icon={<AudioOutlined />}
                  onClick={isRecording ? stopRecording : startRecording}
                  loading={isRecording}
                >
                  {isRecording ? `Recording… ${audioDuration}s` : t('comment.recordAudio')}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={submitComment}
                  disabled={!newComment.trim() && !audioBlob}
                >
                  {t('comment.postComment')}
                </Button>
              </Space>
            </div>
          </div>
        </Space>
      </Card>

      {/* ---- comment tree ---- */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <Text type="secondary">{t('comment.noComments')}</Text>
          <br />
          <Text type="secondary">{t('comment.beFirstToComment')}</Text>
        </div>
      ) : (
        <div>{comments.map(c => <CommentBlock key={c.id} data={c} />)}</div>
      )}
    </Modal>
  );
};

export default CommentSystem;