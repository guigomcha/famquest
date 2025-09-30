import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Badge,
  Tooltip,
  message,
  Tabs,
  Tag,
  Divider
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserAddOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Tree, TreeNode } from 'react-organizational-chart';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { mockUsers, mockEvents } from '../utils/mockData';
import EventCard from '../components/EventCard';
import './FamilyTree.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const FamilyTree = () => {
  const { t } = useTranslation();
  // const [events, setEvents] = useState(mockEvents);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [virtualUsers, setVirtualUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('tree');
  const [userEvents, setUserEvents] = useState([]);

  const relationships = [
    { key: 'parent', label: t('family.parent'), icon: '👨‍👩‍👧‍👦' },
    { key: 'child', label: t('family.child'), icon: '👶' },
    { key: 'spouse', label: t('family.spouse'), icon: '💑' },
    { key: 'sibling', label: t('family.sibling'), icon: '👫' },
    { key: 'friend', label: t('family.friend'), icon: '👬' },
    { key: 'grandparent', label: t('family.grandparent'), icon: '👴' },
    { key: 'grandchild', label: t('family.grandchild'), icon: '👶' },
    { key: 'aunt', label: t('family.aunt'), icon: '👩' },
    { key: 'cousin', label: t('family.cousin'), icon: '👨‍👩‍👧‍👦' },
    { key: 'other', label: t('family.other'), icon: '❓' }
  ];

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = () => {
    setFamilyMembers(mockUsers);
    setVirtualUsers(mockUsers.filter(user => user.isVirtual));
  };

  const showAddModal = () => {
    setModalMode('add');
    setModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (member) => {
    setModalMode('edit');
    setSelectedUser(member);
    setModalVisible(true);
    form.setFieldsValue({
      name: member.name,
      relationship: member.relationship,
      isVirtual: member.isVirtual,
      email: member.email || '',
      phone: member.phone || '',
      bio: member.bio || ''
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'add') {
        // Add new family member
        const newMember = {
          id: uuidv4(),
          name: values.name,
          avatar: values.avatar || 'resources/user-avatars/user1.png',
          relationship: values.relationship,
          role: values.relationship,
          generation: getGenerationForRelationship(values.relationship),
          events: [],
          isVirtual: values.isVirtual || false,
          email: values.email,
          phone: values.phone,
          bio: values.bio,
          createdAt: new Date().toISOString()
        };

        setFamilyMembers([...familyMembers, newMember]);
        
        if (newMember.isVirtual) {
          setVirtualUsers([...virtualUsers, newMember]);
        }
        
        message.success('Family member added successfully!');
      } else {
        // Edit existing member
        const updatedMembers = familyMembers.map(member => 
          member.id === selectedUser.id 
            ? { 
                ...member, 
                name: values.name,
                relationship: values.relationship,
                role: values.relationship,
                generation: getGenerationForRelationship(values.relationship),
                isVirtual: values.isVirtual || false,
                email: values.email,
                phone: values.phone,
                bio: values.bio,
                updatedAt: new Date().toISOString()
              }
            : member
        );

        setFamilyMembers(updatedMembers);
        setVirtualUsers(updatedMembers.filter(user => user.isVirtual));
        
        message.success('Family member updated successfully!');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save family member');
    }
  };

  const handleDelete = (memberId) => {
    Modal.confirm({
      title: 'Delete Family Member',
      content: 'Are you sure you want to remove this family member?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
        setVirtualUsers(virtualUsers.filter(user => user.id !== memberId));
        message.success('Family member deleted successfully!');
      }
    });
  };

  const getGenerationForRelationship = (relationship) => {
    const generationMap = {
      parent: -1,
      grandparent: -2,
      child: 1,
      grandchild: 2,
      sibling: 0,
      spouse: 0,
      friend: 0,
      aunt: -1,
      cousin: 0,
      other: 0
    };
    return generationMap[relationship] || 0;
  };

  const buildFamilyTree = () => {
    const generations = {};
    
    // Group by generation
    familyMembers.forEach(member => {
      if (!generations[member.generation]) {
        generations[member.generation] = [];
      }
      generations[member.generation].push(member);
    });

    // Sort generations
    const sortedGenerations = Object.keys(generations)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(gen => ({
        generation: parseInt(gen),
        members: generations[gen]
      }));

    return sortedGenerations;
  };

  const renderFamilyMember = (member) => {
    const relationshipConfig = relationships.find(r => r.key === member.relationship);
    
    return (
      <Card
        key={member.id}
        className={`member-card ${member.isVirtual ? 'virtual' : ''}`}
        hoverable
        onClick={() => setSelectedUser(member)}
      >
        <div className="member-content">
          <Avatar
            src={member.avatar}
            size={64}
            icon={!member.avatar && <UserOutlined />}
            className="member-avatar"
          />
          
          <div className="member-info">
            <Title level={5} className="member-name">
              {member.name}
              {member.isVirtual && (
                <Tag size="small" className="virtual-tag">
                  {t('user.virtualUser')}
                </Tag>
              )}
            </Title>
            
            <div className="member-relationship">
              <Space>
                <span>{relationshipConfig?.icon}</span>
                <Text>{relationshipConfig?.label}</Text>
              </Space>
            </div>
            
            {member.events && member.events.length > 0 && (
              <div className="member-events">
                <Text type="secondary">
                  {member.events.length} {t('event.events')}
                </Text>
              </div>
            )}
          </div>
          
          <div className="member-actions">
            <Space>
              <Tooltip title={t('common.view')}>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    showUserEvents(member);
                  }}
                />
              </Tooltip>
              <Tooltip title={t('common.edit')}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    showEditModal(member);
                  }}
                />
              </Tooltip>
              {!member.isVirtual && (
                <Tooltip title={t('user.createVirtualUser')}>
                  <Button
                    type="text"
                    icon={<UserAddOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      createVirtualVersion(member);
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title={t('common.delete')}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(member.id);
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  const createVirtualVersion = (member) => {
    const virtualMember = {
      ...member,
      id: uuidv4(),
      name: member.name + ' (Virtual)',
      isVirtual: true,
      events: [],
      createdAt: new Date().toISOString()
    };
    
    setFamilyMembers([...familyMembers, virtualMember]);
    setVirtualUsers([...virtualUsers, virtualMember]);
    
    message.success('Virtual user created successfully!');
  };

  const showUserEvents = (user) => {
    setSelectedUser(user);
    setUserEvents(user.events || []);
    setActiveTab('events');
  };

  const familyTreeData = buildFamilyTree();

  return (
    <div className="family-tree-page">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="gradient-text">
            <TeamOutlined /> {t('family.familyTree')}
          </Title>
          <Text type="secondary">
            {t('family.manageFamily')}
          </Text>
        </div>
        
        <div className="header-actions">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              {t('family.addMember')}
            </Button>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => {
                setModalMode('add');
                form.setFieldsValue({ isVirtual: true });
                setModalVisible(true);
              }}
            >
              {t('user.createVirtualUser')}
            </Button>
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="family-tabs"
      >
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              {t('family.familyTree')} ({familyMembers.length})
            </span>
          }
          key="tree"
        >
          <div className="tree-section">
            <Row gutter={[16, 16]}>
              {familyTreeData.map(({ generation, members }) => (
                <Col key={generation} xs={24}>
                  <Card
                    title={
                      <div className="generation-header">
                        <CrownOutlined />
                        <span>
                          {generation === 0 ? 'Current Generation' : 
                           generation > 0 ? `Generation +${generation}` : 
                           `Generation ${generation}`}
                        </span>
                        <Badge count={members.length} />
                      </div>
                    }
                    className="generation-card"
                  >
                    <Row gutter={[16, 16]}>
                      {members.map(renderFamilyMember)}
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserOutlined />
              {t('user.virtualUser')} ({virtualUsers.length})
            </span>
          }
          key="virtual"
        >
          <div className="virtual-users-section">
            <Row gutter={[16, 16]}>
              {virtualUsers.map(renderFamilyMember)}
            </Row>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <StarOutlined />
              {selectedUser?.name || 'User Events'} ({userEvents.length})
            </span>
          }
          key="events"
        >
          <div className="user-events-section">
            {selectedUser ? (
              <Row gutter={[16, 16]}>
                {userEvents.map(event => (
                  <Col key={event.id} xs={24} sm={12} lg={8}>
                    <EventCard
                      event={event}
                      showActions={true}
                      onLike={() => message.success('Event liked!')}
                      onShare={() => message.success('Shared!')}
                      onComment={() => message.info('Comments coming soon!')}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-state">
                <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
                <Title level={4}>Select a user to view their events</Title>
                <Text type="secondary">
                  Click on a family member to see their events
                </Text>
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? t('family.addMember') : t('family.editMember')}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={t('user.name')}
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="relationship"
            label={t('family.relationship')}
            rules={[{ required: true, message: 'Please select relationship' }]}
          >
            <Select placeholder="Select relationship">
              {relationships.map(rel => (
                <Option key={rel.key} value={rel.key}>
                  <Space>
                    <span>{rel.icon}</span>
                    <span>{rel.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={t('user.email')}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={t('user.phone')}
              >
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bio"
            label={t('user.bio')}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter bio or description"
            />
          </Form.Item>

          <Form.Item
            name="isVirtual"
            label={t('user.virtualUser')}
            valuePropName="checked"
          >
            <Select placeholder="Select user type">
              <Option value={false}>Real User</Option>
              <Option value={true}>Virtual User</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UserAddOutlined />}
              >
                {modalMode === 'add' ? t('family.addMember') : t('common.save')}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FamilyTree;