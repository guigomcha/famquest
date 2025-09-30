import React, { useState, useCallback } from 'react';
import {
  Upload,
  Button,
  message,
  Space,
  Progress,
  Tooltip,
  Modal,
  Image,
  Row,
  Col,
  Card,
  Typography
  
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const MediaUpload = ({
  onUpload,
  accept = 'image/*,video/*',
  multiple = true,
  maxCount = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  onRemove,
  showUploadList = false,
  disabled = false
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const beforeUpload = (file) => {
    // Check file size
    if (file.size > maxSize) {
      message.error(`${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return false;
    }

    // Check file count
    if (fileList.length >= maxCount) {
      message.error(`Maximum ${maxCount} files allowed`);
      return false;
    }

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return false;
    }

    return true;
  };

  const handleChange = (info) => {
    let newFileList = [...info.fileList];
    
    // Limit the number of uploaded files
    newFileList = newFileList.slice(0, maxCount);
    
    setFileList(newFileList);

    if (info.file.status === 'uploading') {
      setUploading(true);
      setUploadProgress(prev => ({
        ...prev,
        [info.file.uid]: info.file.percent || 0
      }));
    }

    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[info.file.uid];
        return newProgress;
      });
      
      // Call onUpload callback
      if (onUpload) {
        onUpload([info.file.originFileObj]);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[info.file.uid];
        return newProgress;
      });
    }

    if (info.fileList.every(file => file.status === 'done' || file.status === 'error')) {
      setUploading(false);
    }
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    
    if (onRemove) {
      onRemove(file);
    }
  };

  const showPreview = (file) => {
    setPreviewMedia({
      url: URL.createObjectURL(file.originFileObj || file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name
    });
    setPreviewVisible(true);
  };

  const uploadProps = {
    multiple,
    accept,
    beforeUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    fileList,
    showUploadList: showUploadList ? {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
      previewIcon: <EyeOutlined />,
      removeIcon: <DeleteOutlined />
    } : false,
    customRequest: ({ file, onSuccess, onError, onProgress }) => {
      // Simulate upload progress
      const progress = Math.random() * 50 + 50;
      onProgress({ percent: progress });
      
      setTimeout(() => {
        onSuccess(file);
      }, 1000);
    },
    disabled: disabled || uploading
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <FileImageOutlined style={{ color: '#1890ff' }} />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ color: '#52c41a' }} />;
    }
    return <UploadOutlined />;
  };

  return (
    <div className="media-upload">
      <Dragger {...uploadProps} className="upload-dragger">
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#8b5cf6' }} />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for images and videos. Maximum {maxCount} files, 
          each file should not exceed {maxSize / 1024 / 1024}MB
        </p>
      </Dragger>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress mt-4">
          <Title level={5}>Upload Progress</Title>
          {Object.entries(uploadProgress).map(([uid, percent]) => {
            const file = fileList.find(f => f.uid === uid);
            return (
              <div key={uid} className="progress-item mb-2">
                <Space className="w-full">
                  {getFileIcon(file.type)}
                  <Text className="flex-1" ellipsis>
                    {file.name}
                  </Text>
                  <Progress
                    percent={Math.round(percent)}
                    size="small"
                    status={percent === 100 ? 'success' : 'active'}
                    style={{ width: 100 }}
                  />
                </Space>
              </div>
            );
          })}
        </div>
      )}

      {/* File List */}
      {fileList.length > 0 && (
        <div className="file-list mt-4">
          <Title level={5}>Selected Files ({fileList.length}/{maxCount})</Title>
          <Row gutter={[16, 16]}>
            {fileList.map(file => (
              <Col key={file.uid} xs={24} sm={12} md={8} lg={6}>
                <Card
                  size="small"
                  className="file-card"
                  cover={
                    file.type?.startsWith('image/') ? (
                      <Image
                        src={URL.createObjectURL(file.originFileObj || file)}
                        alt={file.name}
                        className="file-preview-image"
                        preview={false}
                      />
                    ) : (
                      <div className="file-preview-video">
                        <video
                          src={URL.createObjectURL(file.originFileObj || file)}
                          className="video-preview"
                          muted
                        />
                        <PlayCircleOutlined className="video-icon" />
                      </div>
                    )
                  }
                  actions={[
                    <Tooltip title="Preview">
                      <EyeOutlined onClick={() => showPreview(file)} />
                    </Tooltip>,
                    <Tooltip title="Remove">
                      <DeleteOutlined onClick={() => handleRemove(file)} />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <Text ellipsis style={{ maxWidth: '100%' }}>
                        {file.name}
                      </Text>
                    }
                    description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        title={previewMedia?.name}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewMedia?.type === 'image' ? (
          <Image
            src={previewMedia.url}
            alt={previewMedia.name}
            style={{ width: '100%' }}
          />
        ) : (
          <video
            src={previewMedia?.url}
            controls
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default MediaUpload;