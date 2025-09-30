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
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;
const { TabPane } = Tabs;

const CommentSystem = ({ visible, onClose, event, mediaId = null, onCommentAdded }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playingAudios, setPlayingAudios] = useState(new Set());
  const mediaRecorderRef = useRef(null);
  const audioRefs = useRef({});

  /* ----------  lifecycle  ---------- */
  useEffect(() => {
    if (event) loadComments();
  }, [event, mediaId]);

  /* ----------  data  ---------- */
  const loadComments = () => {
    const all = event.comments || [];
    const filtered = mediaId
      ? all.filter(c => c.mediaId === mediaId)
      : all.filter(c => !c.mediaId);
    setComments(filtered);
  };

  /* ----------  audio  ---------- */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: 'audio/wav' }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      let dur = 0;
      const iv = setInterval(() => {
        dur += 0.1;
        setAudioDuration(Math.floor(dur));
      }, 100);
      recorder.onstop = () => {
        clearInterval(iv);
        stream.getTracks().forEach(t => t.stop());
        setAudioBlob(new Blob(chunks, { type: 'audio/wav' }));
      };
    } catch {
      message.error('Cannot access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (id) => {
    const next = new Set(playingAudios);
    if (next.has(id)) {
      next.delete(id);
      audioRefs.current[id]?.pause();
    } else {
      next.add(id);
      audioRefs.current[id]?.play();
    }
    setPlayingAudios(next);
  };

  /* ----------  submit  ---------- */
  const submitComment = () => {
    if (!newComment.trim() && !audioBlob) {
      message.warning('Please add a comment or record audio');
      return;
    }
    const comment = {
      uuid: uuidv4(),
      user: { name: 'You', avatar: 'resources/user-avatars/user1.png' },
      text: newComment.trim(),
      audio: audioBlob ? URL.createObjectURL(audioBlob) : null,
      audioDuration,
      timestamp: new Date().toISOString(),
      mediaId,
      likes: 0,
      replies: []
    };
    setComments([comment, ...comments]);
    setNewComment('');
    setAudioBlob(null);
    setAudioDuration(0);
    onCommentAdded?.(comment);
    message.success('Comment added!');
  };

  const deleteComment = (uuid) =>
    setComments(comments.filter(c => c.uuid !== uuid));

  /* ----------  render  ---------- */
  const renderComment = (item) => (
    <List.Item
      key={item.uuid}
      actions={[
        <Button type="text" size="small" icon={<HeartOutlined />}>
          {item.likes || 0}
        </Button>,
        <Button type="text" size="small">
          Reply
        </Button>,
        item.user.name === 'You' && (
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => deleteComment(item.uuid)}
          />
        )
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={item.user.avatar} />}
        title={
          <Space>
            <Text strong>{item.user.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </Space>
        }
        description={
          <>
            {item.text && <div style={{ marginBottom: 8 }}>{item.text}</div>}
            {item.audio && (
              <Space className="audio-comment">
                <Button
                  shape="circle"
                  size="small"
                  icon={
                    playingAudios.has(item.uuid) ? (
                      <PauseCircleOutlined />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={() => playAudio(item.uuid)}
                />
                <audio
                  ref={(el) => (audioRefs.current[item.uuid] = el)}
                  src={item.audio}
                  onEnded={() =>
                    setPlayingAudios((p) => {
                      const n = new Set(p);
                      n.delete(item.uuid);
                      return n;
                    })
                  }
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {Math.floor(item.audioDuration / 60)}:
                  {(item.audioDuration % 60).toString().padStart(2, '0')}
                </Text>
              </Space>
            )}
          </>
        }
      />
    </List.Item>
  );

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
          <Badge count={comments.length} showZero />
        </Space>
      }
    >
      {/* media preview */}
      {mediaId && event?.media && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <PictureOutlined />
            <span>Media preview</span>
          </Space>
          <div style={{ marginTop: 8 }}>
            {event.media.find((m) => m.id === mediaId)?.type === 'image' ? (
              <img
                src={event.media.find((m) => m.id === mediaId)?.url}
                alt="media"
                style={{ maxHeight: 160, borderRadius: 4 }}
              />
            ) : (
              <video
                src={event.media.find((m) => m.id === mediaId)?.url}
                controls
                style={{ maxHeight: 160 }}
              />
            )}
          </div>
        </Card>
      )}

      {/* input */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar src="resources/user-avatars/user1.png" />
          <div style={{ flex: 1 }}>
            <TextArea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('comment.addComment')}
            />
            {audioBlob && (
              <Space style={{ marginTop: 6 }}>
                <Button
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => new Audio(URL.createObjectURL(audioBlob)).play()}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {Math.floor(audioDuration / 60)}:
                  {(audioDuration % 60).toString().padStart(2, '0')}
                </Text>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioDuration(0);
                  }}
                />
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
                  {isRecording
                    ? `Recording... ${audioDuration}s`
                    : t('comment.recordAudio')}
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

      {/* list */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <Text type="secondary">{t('comment.noComments')}</Text>
          <br />
          <Text type="secondary">{t('comment.beFirstToComment')}</Text>
        </div>
      ) : (
        <List
          dataSource={comments}
          renderItem={renderComment}
          size="small"
          split
        />
      )}
    </Modal>
  );
};

export default CommentSystem;