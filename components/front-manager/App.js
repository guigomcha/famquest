import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { EnvironmentOutlined, PictureOutlined, AppstoreOutlined, HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './css/App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const [view, setView] = useState('home');
  const { t } = useTranslation();

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header style={{ position: 'fixed', top: 0, width: '100%', zIndex: 10, background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56 }}>
        <span style={{ fontWeight: 'bold', fontSize: 22, letterSpacing: 1 }}>FamQuest</span>
      </Header>
      <Content style={{ marginTop: 56, marginBottom: 64, padding: 0 }}>
        {view === 'home' && (
          <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
            <h2>{t('welcomeTitle', '¡Bienvenido a FamQuest!')}</h2>
            <img src="assets/famquest-logo.png" alt="FamQuest Logo" style={{ width: 120, marginBottom: 16 }} />
            <p>{t('frontDescription', 'Descubre, comparte y conecta con tu familia en una sola app.')}</p>
            <h3>{t('coreObjectivesTitle', 'Objetivos principales')}</h3>
            <ul style={{ textAlign: 'left' }}>
              <li>{t('coreObjective1', 'Crear y explorar el árbol familiar')}</li>
              <li>{t('coreObjective2', 'Compartir recuerdos y fotos')}</li>
              <li>{t('coreObjective3', 'Registrar eventos importantes')}</li>
              <li>{t('coreObjective4', 'Ubicar lugares familiares en el mapa')}</li>
              <li>{t('coreObjective5', 'Conectar con familiares')}</li>
              <li>{t('coreObjective6', 'Mantener la privacidad y seguridad')}</li>
            </ul>
          </div>
        )}
        {view === 'map' && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <h2>{t('map', 'Mapa')}</h2>
            {/* Aquí iría el componente del mapa */}
          </div>
        )}
        {view === 'feed' && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <h2>{t('feed', 'Feed de eventos')}</h2>
            {/* Aquí iría el feed de eventos */}
          </div>
        )}
        {view === 'upload' && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <h2>{t('upload', 'Subir fotos')}</h2>
            {/* Aquí iría el formulario para subir fotos */}
          </div>
        )}
      </Content>
      <Footer style={{ position: 'fixed', bottom: 0, width: '100%', padding: 0, background: '#fff', borderTop: '1px solid #eee', zIndex: 10 }}>
        <Menu mode="horizontal" selectedKeys={[view]} style={{ display: 'flex', justifyContent: 'space-around', border: 'none', boxShadow: '0 -1px 4px rgba(0,0,0,0.03)' }}>
          <Menu.Item key="home" icon={<HomeOutlined style={{ fontSize: 24 }} />} onClick={() => setView('home')}>{t('home', 'Inicio')}</Menu.Item>
          <Menu.Item key="map" icon={<EnvironmentOutlined style={{ fontSize: 24 }} />} onClick={() => setView('map')}>{t('map', 'Mapa')}</Menu.Item>
          <Menu.Item key="feed" icon={<AppstoreOutlined style={{ fontSize: 24 }} />} onClick={() => setView('feed')}>{t('feed', 'Feed')}</Menu.Item>
          <Menu.Item key="upload" icon={<PictureOutlined style={{ fontSize: 24 }} />} onClick={() => setView('upload')}>{t('upload', 'Subir')}</Menu.Item>
        </Menu>
      </Footer>
    </Layout>
  );
}

export default App;