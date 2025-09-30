import React, { useState } from 'react';
import { Button } from 'antd';
import GenericForm from './GenericForm';
import { Spin } from 'antd';
import '../css/classes.css';
import { useTranslation } from "react-i18next";
import { SpotFromForm, GlobalMessage } from '../functions/components_helper';

// This request the baseline info to create a new Spot in DB
const SpotForm = ({ initialData, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectValue, setSelectValue] = useState(initialData?.discovered?.condition?.parameterType || 'location');


  const handleSelectValue = (value) => {
    setSelectValue(value);
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const resp = await SpotFromForm(values, initialData);
    if (!resp){
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
    { name: 'condition', label: t('editDiscoverOptionSelect'), type: 'select', required: true, initialValue: selectValue, options: [
      { value: 'location', label: t('discoverLocation') },
      { value: 'date', label: t('discoverDate') }
    ] },
    ...(selectValue === 'date' ? [{ name: 'date', label: t('date'), type: 'date', required: true, initialValue: initialData?.discovered?.condition?.thresholdTarget || new Date().toISOString().split('T')[0] }] : []),
    { name: 'show', label: t('editDiscoverOptionCheckbox'), type: 'text', required: false, initialValue: initialData?.discovered?.show || false },
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

export default SpotForm;
