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
      {/* TODO: Add some space */}

      <Content className="main-content">
        <div className="content-wrapper">{children}</div>
      </Content>

      <CommentSystem
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        event={{ id: 'current-event' }}
      />

      <Footer className="footer">
        <div className="footer-content">
          <div className="gradient-text font-semibold">FamQuest</div>
          <div className="text-gray-500 text-sm">© 2025 FamQuest GuiGomCha. {t('common.footer')}</div>
        </div>
      </Footer>
    </AntLayout>
  );
};

export default AntCustomLayout;