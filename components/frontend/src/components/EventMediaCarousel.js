import React, { useMemo, useRef, useState } from 'react';
import { Carousel, Image, Button, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { mockMedia } from '../utils/mockData';          // adjust path
import './EventMediaCarousel.css';               // contains bigger-arrow styles


export const EventMediaCarousel =  ({ mediaIds, title, eventId }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const videoRefs = useRef({});
  const [playingVideos, setPlayingVideos] = useState(new Set([]));

  /* map ids -> objects only when we need them ----------------------------- */
  const mediaList = useMemo(
    () => mediaIds.map(id => mockMedia.find(m => m.id === id)).filter(Boolean),
    [mediaIds]
  );

  /* helpers --------------------------------------------------------------- */
  const openImageModal = (index) => {
    setSelectedImage(index);
    setImageModalVisible(true);
  };

  const toggleVideoPlayback = (mediaId) => {
    const el = videoRefs.current[mediaId];
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlayingVideos(prev => new Set(prev).add(mediaId));
    } else {
      el.pause();
      setPlayingVideos(prev => {
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
    }
  };

  /* render ---------------------------------------------------------------- */
  return (
    <div className="media-container">
      {mediaList.length ? (
        <Carousel
          infinite={false}
          dots
          arrows
          prevArrow={<LeftOutlined className="carousel-arrow bigger" />}
          nextArrow={<RightOutlined className="carousel-arrow bigger" />}
          className="event-media-carousel"
        >
          {mediaList.map((media, index) => (
            <div key={media.id} className="media-item">
              {media.type === 'image' && (
                <Image
                  src={media.url}
                  alt={`${title} - ${eventId}`}
                  className="event-image"
                  // TODO: this does not work. Always shows the same image
                  preview={{
                    visible: imageModalVisible,
                    onVisibleChange: setImageModalVisible,
                    current: selectedImage,
                  }}
                  onClick={() => openImageModal(index)}
                />
              )}

              {(media.type === 'video' || media.type === 'media') && (
                <div className="video-container">
                  <video
                    ref={el => (videoRefs.current[media.id] = el)}
                    src={media.url}
                    className="event-video"
                    muted
                    loop
                    playsInline
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={
                      playingVideos.has(media.id) ? (
                        <PauseCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                    className="video-play-button"
                    onClick={e => {
                      e.stopPropagation();
                      toggleVideoPlayback(media.id);
                    }}
                  />
                </div>
              )}

              {(media.type === 'audio' || media.url.endsWith('.pdf')) && (
                <div className="unsupported-media">
                  {message.info(
                    `Media type “${media.type}” (or PDF) is not supported yet.`
                  )}
                </div>
              )}
            </div>
          ))}
        </Carousel>
      ) : null}
    </div>
  );
};

export default EventMediaCarousel;