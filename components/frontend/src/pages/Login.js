import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Divider, 
  Select, 
  message,
  Row,
  Col,
  Image,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  GlobalOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { workspacePresets } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import './Login.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('demo');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setWorkspace } = useWorkspace();
  const { t, i18n } = useTranslation();

  // Handle OAuth2 callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const workspace = urlParams.get('workspace') || 'demo';

      if (code) {
        setOauthLoading(true);
        try {
          // Exchange OAuth code for token
          const tokenResponse = await exchangeOAuthCode(code, state, workspace);
          
          if (tokenResponse.success) {
            // Set workspace context
            setWorkspace(workspacePresets[workspace] || workspacePresets.demo);
            
            // Store authentication data
            localStorage.setItem('authToken', tokenResponse.token);
            localStorage.setItem('userData', JSON.stringify(tokenResponse.user));
            localStorage.setItem('workspace', JSON.stringify(workspacePresets[workspace] || workspacePresets.demo));
            
            message.success('Login successful!');
            navigate('/');
          } else {
            throw new Error(tokenResponse.error || 'OAuth authentication failed');
          }
        } catch (error) {
          message.error(error.message || 'Authentication failed');
        } finally {
          setOauthLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, '/login');
        }
      }
    };

    handleOAuthCallback();
  }, [navigate, setWorkspace]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Set workspace before login
      setWorkspace(workspacePresets[selectedWorkspace] || workspacePresets.demo);
      
      const result = await login(values);
      
      if (result.success) {
        // Navigate to home will be handled by AuthContext
      } else {
        message.error(result.error || 'Login failed');
      }
    } catch (error) {
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth2Login = (provider) => {
    const workspace = selectedWorkspace;
    const state = generateState();
    const nonce = generateNonce();
    
    // Store state and nonce for validation
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_nonce', nonce);
    localStorage.setItem('oauth_workspace', workspace);
    
    // Build OAuth2 authorization URL
    const authUrl = buildAuthorizationUrl(provider, state, nonce, workspace);
    
    // Redirect to OAuth2 provider
    window.location.href = authUrl;
  };

  const buildAuthorizationUrl = (provider, state, nonce, workspace) => {
    const baseUrl = getOAuth2BaseUrl(workspace);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: getClientId(workspace),
      redirect_uri: `${window.location.origin}/login`,
      scope: 'openid profile email',
      state: state,
      nonce: nonce,
      workspace: workspace
    });
    
    return `${baseUrl}/auth?${params.toString()}`;
  };

  const getOAuth2BaseUrl = (workspace) => {
    // Mock Keycloak URLs based on workspace
    const keycloakUrls = {
      demo: 'https://keycloak-demo.eventfeed.com/realms/demo/protocol/openid-connect',
      company1: 'https://keycloak.company1.com/realms/company1/protocol/openid-connect',
      company2: 'https://keycloak.company2.com/realms/company2/protocol/openid-connect'
    };
    return keycloakUrls[workspace] || keycloakUrls.demo;
  };

  const getClientId = (workspace) => {
    // Mock client IDs
    const clientIds = {
      demo: 'eventfeed-demo-client',
      company1: 'eventfeed-company1-client',
      company2: 'eventfeed-company2-client'
    };
    return clientIds[workspace] || clientIds.demo;
  };

  const generateState = () => {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  };

  const generateNonce = () => {
    return btoa(Math.random().toString(36).substring(2));
  };

  const exchangeOAuthCode = async (code, state, workspace) => {
    // Mock OAuth2 token exchange
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate state
    const storedState = localStorage.getItem('oauth_state');
    const storedNonce = localStorage.getItem('oauth_nonce');
    
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    // Clean up stored values
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_nonce');
    localStorage.removeItem('oauth_workspace');
    
    // Mock user data based on workspace
    const userData = generateMockUser(workspace);
    
    return {
      success: true,
      token: 'oauth-jwt-token-' + Date.now(),
      user: userData
    };
  };

  const generateMockUser = (workspace) => {
    const workspaceConfig = workspacePresets[workspace] || workspacePresets.demo;
    
    return {
      id: `user-${workspace}-${Date.now()}`,
      name: `User ${workspace}`,
      email: `user@${workspace}.com`,
      avatar: 'resources/user-avatars/user1.png',
      role: 'user',
      permissions: ['read', 'write', 'create_events', 'create_family_tree'],
      workspace: workspaceConfig.name
    };
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleWorkspaceChange = (workspace) => {
    setSelectedWorkspace(workspace);
    // Update form to show workspace-specific fields
    form.setFieldsValue({ workspace });
  };

  // Demo login for testing
  const handleDemoLogin = () => {
    form.setFieldsValue({
      email: 'demo@eventfeed.com',
      password: 'demo123',
      workspace: 'demo'
    });
  };

  if (oauthLoading) {
    return (
      <div className="login-container">
        <div className="oauth-loading">
          <Spin size="large" />
          <Title level={3}>{t('auth.login')}</Title>
          <Text>{t('common.loading')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Language Selector */}
        <div className="language-selector">
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            size="small"
            className="language-select"
          >
            <Option value="en">🇺🇸 English</Option>
            <Option value="es">🇪🇸 Español</Option>
          </Select>
        </div>

        <Card className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <Title level={2} className="gradient-text">
                EventFeed
              </Title>
              <Text type="secondary">
                {t('auth.login')}
              </Text>
            </div>
          </div>

          {/* Workspace Selection */}
          <Form.Item
            label={t('common.workspace')}
            name="workspace"
            initialValue={selectedWorkspace}
          >
            <Select
              value={selectedWorkspace}
              onChange={handleWorkspaceChange}
              placeholder="Select workspace"
            >
              {Object.entries(workspacePresets).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    <GlobalOutlined />
                    <span>{config.displayName}</span>
                    <Text type="secondary">({config.description})</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          {/* OAuth2 Providers */}
          <div className="oauth-section">
            <Title level={4}>{t('auth.loginWith')}</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                icon={<KeyOutlined />}
                size="large"
                block
                onClick={() => initiateOAuth2Login('keycloak')}
                className="oauth-button keycloak"
              >
                Keycloak (OAuth2)
              </Button>
              
              <Button
                type="default"
                icon={<UserOutlined />}
                size="large"
                block
                onClick={() => initiateOAuth2Login('google')}
                className="oauth-button google"
              >
                Google
              </Button>
              
              <Button
                type="default"
                icon={<GlobalOutlined />}
                size="large"
                block
                onClick={() => initiateOAuth2Login('microsoft')}
                className="oauth-button microsoft"
              >
                Microsoft
              </Button>
            </Space>
          </div>

          <Divider>
            <Text type="secondary">{t('common.or')}</Text>
          </Divider>

          {/* Traditional Login Form */}
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={t('auth.email')}
              rules={[
                { required: true, message: t('auth.emailRequired') },
                { type: 'email', message: t('auth.invalidEmail') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('auth.email')}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[
                { required: true, message: t('auth.passwordRequired') }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.password')}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                block
              >
                {t('auth.login')}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          {/* Demo Login */}
          <div className="demo-section">
            <Text type="secondary">
              Try the demo:
            </Text>
            <Button
              type="link"
              onClick={handleDemoLogin}
              size="small"
            >
              Load Demo Credentials
            </Button>
          </div>

          {/* Workspace Info */}
          {selectedWorkspace && (
            <div className="workspace-info">
              <Divider />
              <Text type="secondary">
                Connecting to: {workspacePresets[selectedWorkspace]?.displayName}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Backend: {workspacePresets[selectedWorkspace]?.backend}
              </Text>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="login-footer">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Secured by OAuth2 / Keycloak • {new Date().getFullYear()} EventFeed
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;