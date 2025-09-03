import React, { useState } from 'react';
import { Button } from 'antd';
import GenericForm from './GenericForm';
import { Spin } from 'antd';
import '../css/classes.css';
import { createInDB, updateInDB } from '../functions/db_manager_api';
import { DatePicker, Space } from 'antd';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from '../functions/components_helper';

// This request the baseline info to create a new User in DB
const UserForm = ({ initialData, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let newUser = null;
    if (initialData?.id){
      newUser = await updateInDB(values, 'user');
    } else {
      newUser = await createInDB(values, 'user');
    }
    if (!newUser){
      GlobalMessage(t('internalError'), "error");
    } else {
      GlobalMessage(t('actionCompleted'), "info");
    }
    setIsLoading(false);
    handledFinished("done");
  };

  const fields = [
    { name: 'id', label: `${t('id')} (${t('readOnly')})`, type: 'text', required: false, readOnly: true, initialValue: initialData?.id },
    { name: 'name', label: initialData?.extRef ? `${t('name')} (${t('readOnly')})` : t('name'), type: 'text', required: true, readOnly: !!initialData?.extRef, initialValue: initialData?.name },
    { name: 'birthday', label: t('birthday'), type: 'date', required: true, initialValue: initialData?.birthday?.split('T')[0] },
    { name: 'passing', label: t('passing'), type: 'date', required: false, initialValue: initialData?.passing?.split('T')[0] },
    { name: 'bio', label: t('biography'), type: 'textarea', required: true, placeholder: t('editBiography'), initialValue: initialData?.bio, rows: 10 },
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

export default UserForm;
