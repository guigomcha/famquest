/* FamilyTree.jsx  –  purple index table + 3-tab view + virtual creator  */
import React, { useState, useMemo } from 'react';
import { Table, Card, Avatar, Button, Space, Tag, Modal, Form, Input, Select, Typography, Tabs, message, Row, Col } from 'antd';
import {
  PlusOutlined, TeamOutlined, UserOutlined, UserAddOutlined, EditOutlined, EyeOutlined, DeleteOutlined, CloseOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { mockUsers, mockMedia, mockRelations, mockEvents } from '../utils/mockData';
import EventCard from '../components/EventCard';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/* ----------  colours  ---------- */
const PURPLE_LIGHT = '#f0f5ff'; // header background
const PURPLE_LIGHTER = '#fafafa'; // first-column background
const PURPLE_MAIN = '#8b5cf6'; // borders / badges

/* ----------  helper components  ---------- */
const UserBadge = ({ user, onEdit, onView, isFirstCol = false }) => {

  const avatar = user?.avatar ? mockMedia.find(m => m.id === user.avatar) : null;
  const canEdit = user?.isVirtual || user.id === 'user-1';

  return (
    <Card
      size="small"
      hoverable
      onClick={() => onView(user)}
      style={{
        display: 'inline-block',
        margin: 4,
        width: 140,
        textAlign: 'center',
        border: `2px ${user.isVirtual ? PURPLE_MAIN : '#d9d9d9'}`,
        borderRadius: 8,
        background: user.isVirtual ? '#fff' : '#fff',
        boxShadow: user.id === 'user-1' ? '0 0 0 2px #8b5cf6, 0 0 8px 4px #8b5cf640' : undefined,
        animation: user.id === 'user-1' ? 'pulse 2s infinite' : undefined,
      }}
      bodyStyle={{ padding: 8 }}
    >
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 2px #8b5cf6, 0 0 8px 4px #8b5cf640; }
          50% { box-shadow: 0 0 0 2px #8b5cf6, 0 0 12px 6px #8b5cf680; }
          100% { box-shadow: 0 0 0 2px #8b5cf6, 0 0 8px 4px #8b5cf640; }
        }
      `}</style>

      <Avatar size={32} src={avatar?.url} icon="👤" />
      <div style={{ fontSize: 11, marginTop: 2 }}>{user.name}</div>
      {user.isVirtual && <Tag color={PURPLE_MAIN} style={{ fontSize: 10, marginTop: 2 }}>Virtual</Tag>}
      <Space size={2} style={{ marginTop: 4 }}>
        {canEdit && <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); onEdit(user); }} />}
        <Button size="small" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); onView(user); }} />
      </Space>
    </Card>
  );
};

/* ----------  relationship builder for virtual user  ---------- */
const RelationBuilder = ({ open, onClose, onSave }) => {
  const [relations, setRelations] = useState([]);
  const [relType, setRelType] = useState('spouse');
  const [target, setTarget] = useState('');
  const [name, setName] = useState('');

  const addRelation = () => {
    if (!target) return message.warning('Pick a target user');
    if (relations.some(r => r.target === target && r.type === relType)) return message.warning('Relation already added');
    setRelations([...relations, { type: relType, target }]);
    setTarget('');
  };
  const removeRelation = (idx) => setRelations(relations.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (relations.length === 0) return message.error('At least one relationship is required');
    onSave(relations);
    setRelations([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      title="Create Virtual User & Relations"
      okText="Create"
      cancelText="Cancel"
      width={520}
    >
      <Form layout="vertical">
        <Form.Item label="Name" required>
          <Input placeholder="Virtual name" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>

        <Form.Item label="Add Relation" required>
          <Space.Compact style={{ width: '100%' }}>
            <Select value={relType} onChange={setRelType} style={{ width: 120 }}>
              {['spouse', 'parent', 'child', 'friend', 'pet', 'sibling'].map(r => (
                <Option key={r} value={r}>{r}</Option>
              ))}
            </Select>
            <Select
              value={target}
              onChange={setTarget}
              placeholder="Select user"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {mockUsers.map(u => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
            <Button icon={<PlusOutlined />} onClick={addRelation} />
          </Space.Compact>
        </Form.Item>

        <Form.Item label="Relations (at least one)" required>
          <div style={{ maxHeight: 160, overflowY: 'auto', border: `1px solid ${PURPLE_MAIN}`, borderRadius: 6, padding: 8 }}>
            {relations.length === 0 && <Text type="secondary">No relations added yet</Text>}
            {relations.map((r, idx) => (
              <Card key={idx} size="small" style={{ marginBottom: 4 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>{r.type}</Text>
                  <Text type="secondary">{mockUsers.find(x => x.id === r.target)?.name}</Text>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => removeRelation(idx)} />
                </Space>
              </Card>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ----------  ultra-simple table  ---------- */
const RelationTable = ({ onEdit, onView }) => {
  /* ---- one row per user (only REAL users in first column)  ---- */
  const realUsers = mockUsers.filter(u => !u.isVirtual);
  const data = realUsers.map(u => {
    const spouse = [], children = [], siblings = [], friends = [], pets = [];

    /* spouse + friend (bidirectional) */
    for (const r of mockRelations) {
      if (r.label === 'spouse' && (r.source === u.id || r.target === u.id)) spouse.push(r.source === u.id ? r.target : r.source);
      if (r.label === 'friend' && (r.source === u.id || r.target === u.id)) friends.push(r.source === u.id ? r.target : r.source);
      if (r.label === 'pet' && r.source === u.id) pets.push(r.target);
      if (r.label === 'parent' && r.source === u.id) children.push(r.target);
    }

    /* siblings = users who share a parent */
    const myParents = mockRelations.filter(r => r.label === 'parent' && r.target === u.id).map(r => r.source);
    for (const p of myParents) {
      for (const r of mockRelations) {
        if (r.label === 'parent' && r.source === p && r.target !== u.id) siblings.push(r.target);
      }
    }

    return {
      key: u.id,
      user: u,
      spouse: [...new Set(spouse)],
      children: [...new Set(children)],
      siblings: [...new Set(siblings)],
      friends: [...new Set(friends)],
      pets: [...new Set(pets)],
    };
  });

  /* ---- columns  ---------- */
  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (u) => <UserBadge user={u} onEdit={onEdit} onView={onView} isFirstCol />,
      onHeaderCell: () => ({ style: { backgroundColor: PURPLE_LIGHT } }),
      onCell: () => ({ style: { backgroundColor: PURPLE_LIGHTER } }),
    },
    ...['spouse', 'children', 'siblings', 'friends', 'pets'].map(rel => ({
      title: rel.charAt(0).toUpperCase() + rel.slice(1),
      dataIndex: rel,
      key: rel,
      render: (list) => list.map(id => <UserBadge key={id} user={mockUsers.find(x => x.id === id)} onEdit={onEdit} onView={onView} />),
      onHeaderCell: () => ({ style: { backgroundColor: PURPLE_LIGHT } }),
    })),
  ];

  return <Table columns={columns} dataSource={data} rowKey="key" pagination={false} bordered />;
};

/* ---------------------------------------------------------- */
/*  page shell – single tab + virtual creator               */
/* ---------------------------------------------------------- */
const FamilyTree = () => {
  const { t } = useTranslation();
  const [familyMembers, setFamilyMembers] = useState(mockUsers);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [form] = Form.useForm();
  const [eventModal, setEventModal] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const virtualUsers = familyMembers.filter(u => u.isVirtual);

  /* ---- crud ---- */
  const showAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    form.resetFields();
    setModalVisible(true);
  };
  const showEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };
  // TODO G: this does not work
  const handleSubmit = (vals) => {
    if (modalMode === 'add') {
      const nu = { ...vals, id: uuidv4(), avatar: vals.avatar || '', isVirtual: vals.isVirtual || false };
      setFamilyMembers([...familyMembers, nu]);
      message.success('Added');
    } else {
      setFamilyMembers(m => m.map(x => (x.id === selectedUser.id ? { ...x, ...vals } : x)));
      message.success('Updated');
    }
    setModalVisible(false);
  };
  const handleDelete = (id) => {
    Modal.confirm({
      title: t('common.delete'),
      onOk: () => {
        setFamilyMembers(m => m.filter(x => x.id !== id));
        message.success('Deleted');
      },
    });
  };

  /* ---- create virtual user + relations ---- */
  const createVirtualWithRelations = (rels) => {
    const name = rels.name || 'Virtual ' + uuidv4().slice(0, 4);
    const newUser = { id: uuidv4(), name, avatar: '', bio: '', isVirtual: true, events: [] };
    setFamilyMembers([...familyMembers, newUser]);

    /* add relations */
    const newRels = rels.map(r => ({ id: uuidv4(), source: newUser.id, target: r.target, label: r.type }));
    mockRelations.push(...newRels);

    message.success('Virtual user & relations created');
  };

  /* ---- view user (3-tab modal) ---- */
  const viewUser = (user) => {
    const linkedEvents = user.events?.length
      ? user.events.map(eid => mockEvents.find(ev => ev.id === eid)).filter(Boolean)
      : [];

    const linkedIds = new Set(user.events || []);
    const ownedEvents = mockEvents.filter(ev =>
      ev.owner === user.id && !linkedIds.has(ev.id)
    );

    setEventModal({ user, linkedEvents, ownedEvents });
  };

  return (
    <div className="family-tree-page">
      <Card size="small" className="page-header">
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}>
            <TeamOutlined /> {t('family.familyTree')}
          </Title>
          <Space>
            <Button icon={<UserAddOutlined />} onClick={() => setBuilderOpen(true)}>
              {t('user.addMember')}
            </Button>
          </Space>
        </Space>
      </Card>

      <RelationTable onEdit={showEdit} onView={viewUser} />

      {/* ======  ADD / EDIT REAL USER  ====== */}
      <Modal
        title={modalMode === 'add' ? t('family.addMember') : t('family.editMember')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label={t('user.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="relationship" label={t('family.relationship')} rules={[{ required: true }]}>
            <Select placeholder="Pick relationship">
              {['spouse', 'parent', 'child', 'friend', 'pet', 'sibling'].map(r => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="email" label={t('user.email')}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('user.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label={t('user.bio')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isVirtual" label={t('user.virtualUser')} valuePropName="checked">
            <Select>
              <Option value={false}>Real User</Option>
              <Option value={true}>Virtual User</Option>
            </Select>
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {modalMode === 'add' ? t('common.add') : t('common.save')}
            </Button>
            <Button onClick={() => setModalVisible(false)}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>

      {/* ======  VIRTUAL USER BUILDER  ====== */}
      <RelationBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={createVirtualWithRelations}
      />

      {/* ======  3-TAB VIEW MODAL  ====== */}
      {eventModal && (
        <Modal
          open
          onCancel={() => setEventModal(null)}
          footer={null}
          width={800}
          centered
          bodyStyle={{ padding: 0 }}
          title={`${eventModal.user.name} – Details & Events`}
        >
          <Tabs>
            <TabPane tab="Details" key="details">
              <Card bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Avatar size={64} src={eventModal.user.avatar ? mockMedia.find(m => m.id === eventModal.user.avatar)?.url : ''} icon="👤" />
                  <Title level={4}>{eventModal.user.name}</Title>
                  <Text>Email: {eventModal.user.email || '–'}</Text>
                  <Text>Phone: {eventModal.user.phone || '–'}</Text>
                  <Text>Bio: {eventModal.user.bio || '–'}</Text>
                  <Tag color={eventModal.user.isVirtual ? PURPLE_MAIN : 'default'}>{eventModal.user.isVirtual ? 'Virtual' : 'Real'}</Tag>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab={`Linked Events (${eventModal.linkedEvents.length})`} key="linked">
              {eventModal.linkedEvents.length === 0 ? (
                <Card bordered={false}><Text type="secondary">No linked events</Text></Card>
              ) : (
                eventModal.linkedEvents.map(ev => (
                  <Card key={ev.id} size="small" style={{ marginBottom: 8 }}>
                    <EventCard event={ev} showActions={false} />
                  </Card>
                ))
              )}
            </TabPane>

            <TabPane tab={`Owned Events (${eventModal.ownedEvents.length})`} key="owned">
              {eventModal.ownedEvents.length === 0 ? (
                <Card bordered={false}><Text type="secondary">No owned events</Text></Card>
              ) : (
                eventModal.ownedEvents.map(ev => (
                  <Card key={ev.id} size="small" style={{ marginBottom: 8 }}>
                    <EventCard event={ev} showActions={false} />
                  </Card>
                ))
              )}
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </div>
  );
};

export default FamilyTree;