import React, { useState } from 'react';
import {
  Layout as AntLayout,
  Menu,
  FloatButton,
  message,
  Dropdown,
  Button,
  Space,          // ← added
} from 'antd';
import {
  HomeOutlined,
  CompassOutlined,
  PlusOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CommentOutlined,
  TeamOutlined,
  GlobalOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CommentSystem from './CommentSystem';
import './Layout.css';

const { Content, Footer } = AntLayout;

const AntCustomLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  /* ---------- helpers ---------- */
  const handleMenuClick = ({ key }) => navigate(key);

  const handleLanguageChange = (lang) => i18n.changeLanguage(lang);

  const handleLike = () => message.success('Liked!');
  const handleShare = () => message.success('Shared!');
  const openComments = () => {
    setCurrentEvent({ id: 'current-event' });
    setCommentModalVisible(true);
  };

  /* ---------- menus ---------- */
  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: t('nav.feed') },
    { key: '/map', icon: <CompassOutlined />, label: t('nav.map') },
    { key: '/family', icon: <TeamOutlined />, label: t('nav.family') },
    { key: '/trips', icon: <GlobalOutlined />, label: t('nav.trips') },
    { key: '/upload', icon: <PlusOutlined />, label: t('nav.create') },
    { key: '/profile', icon: <UserOutlined />, label: t('nav.profile') },
  ];

  const languageMenu = (
    <Menu>
      <Menu.Item key="en" onClick={() => handleLanguageChange('en')}>
        <Space>🇺🇸 English</Space>
      </Menu.Item>
      <Menu.Item key="es" onClick={() => handleLanguageChange('es')}>
        <Space>🇪🇸 Español</Space>
      </Menu.Item>
    </Menu>
  );

  /* ---------- render ---------- */
  return (
    <AntLayout className="layout">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <div className="gradient-text text-xl font-bold">EventFeed</div>
            <div className="text-xs text-gray-500">{t('common.discoverEvents')}</div>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="navigation-menu"
          />

          <Dropdown overlay={languageMenu} placement="bottomRight">
            <Button
              type="text"
              icon={<TranslationOutlined />}
              className="language-button"
            >
              {i18n.language.toUpperCase()}
            </Button>
          </Dropdown>
        </div>
      </div>

      <Content className="main-content">
        <div className="content-wrapper">{children}</div>
      </Content>

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 100 }}>
        <FloatButton icon={<HeartOutlined />} tooltip={t('common.like')} onClick={handleLike} />
        <FloatButton icon={<ShareAltOutlined />} tooltip={t('common.share')} onClick={handleShare} />
        <FloatButton icon={<CommentOutlined />} tooltip={t('common.comment')} onClick={openComments} />
        <FloatButton icon={<PlusOutlined />} tooltip={t('nav.create')} onClick={() => navigate('/upload')} type="primary" />
      </FloatButton.Group>

      <CommentSystem
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        event={{ id: 'current-event' }}
      />

      <Footer className="footer">
        <div className="footer-content">
          <div className="gradient-text font-semibold">EventFeed</div>
          <div className="text-gray-500 text-sm">© 2025 EventFeed. {t('common.connectingCommunities')}</div>
        </div>
      </Footer>
    </AntLayout>
  );
};

export default AntCustomLayout;