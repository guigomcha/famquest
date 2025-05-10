import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Button, Spin, Typography, Alert, Table } from 'antd';
import { EditOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import SpotForm from './SpotForm';
import NoteForm from './NoteForm';
import { GlobalMessage } from '../functions/components_helper';
import { renderDescription, renderEmptyState } from '../functions/render_message';
import { getUserInfo, deleteInDB, fetchAndPrepareSpots, getInDB } from '../functions/db_manager_api';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";
import Note from './Note';

const { Title, Text, Link } = Typography;

const SpotPopup = ({ location, handledFinished, user }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ id: 0 });
  const [spotInfo, setSpotInfo] = useState({ id: location.refId });
  const [reload, setReload] = useState(true);
  const [notes, setNotes] = useState([]);

  const handleRequestEdit = () => {
    setComponent(<SpotForm initialData={spotInfo} handledFinished={handleNestedRequestEdit} />);
  };

  const handleRequestNewNote = () => {
    setComponent(
      <NoteForm
        handledFinished={handleNestedRequestEdit}
        userId={info.id}
        parentInfo={spotInfo}
        refType="spot"
      />
    );
  };

  const handleRequestDelete = async () => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(spotInfo.id, 'spot');
    if (deleteResponse === 'OK') {
      GlobalMessage(t('actionCompleted'), 'info');
      handledFinished({ msg: 'done', id: spotInfo.id });
      setComponent(null);
    } else {
      GlobalMessage(t('actionInvalid'), 'warning');
    }
    setIsLoading(false);
  };

  const handleNestedRequestEdit = async (comp) => {
    if (comp === 'done' || !comp) {
      await fetchRelatedInfo(spotInfo);
      setComponent(null);
      setReload(!reload);
    } else {
      setComponent(comp);
    }
  };

  const fetchRelatedInfo = async (model) => {
    setIsLoading(true);
    const tempSpot = await fetchAndPrepareSpots(model.refId, user);
    tempSpot.location = location;
    setSpotInfo(tempSpot);

    if (!tempSpot) {
      setIsLoading(false);
      return;
    }

    const tempNotes = await getInDB('note', 0, `?refId=${tempSpot.id}&refType=spot`);
    const updatedNotes = await Promise.all(
      tempNotes.map(async (note) => {
        const userInfo = await getUserInfo(note.refUserUploader);
        return { ...note, userInfo };
      })
    );
    setNotes(updatedNotes);

    const userInfo = await getUserInfo(tempSpot.refUserUploader);
    setInfo(userInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRelatedInfo(location);
  }, [component, reload]);

  return (
    <>
      {isLoading && <Spin>{t('loading')}</Spin>}
      <Card title={`${t('spot')}: ${spotInfo.name}`} extra={`ID: ${spotInfo.id}`}>
        {!spotInfo.id && <Alert message={`${t('invalidSpot')} ${JSON.stringify(location)}`} type="error" showIcon />}

        <Text>{renderDescription(spotInfo.description)}</Text>

        <div style={{ marginTop: '1rem' }}>
          <Text strong>{t('owner')}: </Text>
          <Text>{info.name}</Text>
        </div>

        {user.id === spotInfo.refUserUploader && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
            <Button icon={<EditOutlined />} onClick={handleRequestEdit} type="primary">
              {t('edit')}
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleRequestDelete} danger>
              {t('delete')}
            </Button>
          </div>
        )}

        <Card style={{ marginTop: '1rem', marginBottom: '3rem' }} title={t('notesInSpot')}>
          {notes.length > 0 ? (
            <Table
              dataSource={notes}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: t('name'),
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Link
                      onClick={() =>
                        handleNestedRequestEdit(
                          <Note
                            initialData={record}
                            user={user}
                            parentInfo={spotInfo}
                            refType="spot"
                            handledFinished={handleNestedRequestEdit}
                          />
                        )
                      }
                    >
                      {text}
                    </Link>
                  ),
                },
                {
                  title: t('category'),
                  dataIndex: 'category',
                  key: 'category',
                  render: (category) => (
                    <Badge color="blue" text={category} />
                  ),
                },
                {
                  title: t('owner'),
                  key: 'owner',
                  render: (_, record) => (
                    <Badge color="purple" text={record.userInfo?.name || '—'} />
                  ),
                },
                {
                  title: t('datetimeRef'),
                  dataIndex: 'datetime',
                  key: 'datetime',
                  render: (datetime) => (
                    <Text type="secondary">{datetime}</Text>
                  ),
                },
              ]}
            />
          ) : (
            renderEmptyState(t('empty'))
          )}
          <div style={{ marginTop: '1rem' }}>
            <Button icon={<AppstoreAddOutlined />} type="primary" onClick={handleRequestNewNote}>
              {t('new')}
            </Button>
          </div>
        </Card>
      </Card>

      <SlideMenu component={component} handledFinished={handleNestedRequestEdit} />
    </>
  );
};

export default SpotPopup;
