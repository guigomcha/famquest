import React, { useState } from 'react';
import { Button } from 'antd';
import GenericForm from './GenericForm';
import { Spin } from 'antd';
import '../css/classes.css';
import { updateInDB, createInDB, addReferenceInDB } from '../functions/db_manager_api';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from '../functions/components_helper';


// This request the baseline info to create a new Note in DB
const NoteForm = ({ initialData, parentInfo, refType, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    values.datetime = values.datetime.format('YYYY-MM-DD') + 'T00:00:00Z';
    let newNote = {};
    if (values.id) {
      newNote = await updateInDB(values, 'note');
    } else {
      newNote = await createInDB(values, 'note');
      await addReferenceInDB(newNote.id, parentInfo.id, refType, 'note');
    }
    if (!newNote){
      GlobalMessage(t('internalError'), "error");
    } else {
      GlobalMessage(t('actionCompleted'), "info");
    }
    setIsLoading(false);
    handledFinished("done");
  };

  const fields = [
    { name: 'id', label: `${t('id')} (${t('readOnly')})`, type: 'text', required: false, readOnly: true, initialValue: initialData?.id },
    { name: 'name', label: t('name'), type: 'text', required: true, placeholder: t('editName'), initialValue: initialData?.name },
    { name: 'category', label: t('category'), type: 'text', required: true, placeholder: t('editCategory'), initialValue: initialData?.category },
    { name: 'datetime', label: t('datetime'), type: 'date', required: true, initialValue: initialData?.datetime?.split('T')[0] ? initialData?.datetime?.split('T')[0] : undefined },
    { name: 'description', label: t('description'), type: 'textarea', required: true, placeholder: t('editDescription'), initialValue: initialData?.description, rows: 10 },
  ];
  return (
    <GenericForm
      fields={fields.filter(f => initialData?.id ? true : f.name !== 'id')}
      onFinish={handleSubmit}
      loading={isLoading}
      submitText={t('submit')}
      initialValues={fields.reduce((acc, f) => { if (f.initialValue !== undefined) acc[f.name] = f.initialValue; return acc; }, {})}
    />
  );
};

export default NoteForm;
