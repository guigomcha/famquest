import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadAttachment, updateInDB, addReferenceInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import MediaForm from './MediaForm';


const ImagesForm = ({ initialData, refType, handledFinished }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const dataToUpload = values.file;
    values.datetime = values.datetime.format('YYYY-MM-DD') + 'T00:00:00Z';
    values.contentType = dataToUpload?.type;
    let attachment;
    if (initialData?.id) {
      attachment = await updateInDB(values, 'attachment');
    } else {
      attachment = await uploadAttachment(dataToUpload, values);
      if (attachment) {
        await addReferenceInDB(attachment.id, initialData.refId, refType, 'attachment');
      }
    }
    if (attachment) {
      GlobalMessage(t('actionCompleted'), 'info');
    } else {
      GlobalMessage(t('internalError'), 'error');
    }
    setIsLoading(false);
    handledFinished('done');
  };

  const fields = [
    { name: 'id', label: `${t('id')} (${t('readOnly')})`, type: 'text', required: false, readOnly: true, initialValue: initialData?.id },
    { name: 'name', label: t('name'), type: 'text', required: true, placeholder: t('editName'), initialValue: initialData?.name },
    { name: 'datetime', label: t('datetime'), type: 'date', required: true, initialValue: initialData?.datetime?.split('T')[0] },
    { name: 'description', label: t('description'), type: 'textarea', required: true, placeholder: t('editDescription'), initialValue: initialData?.description, rows: 10 },
  ];
  return (
    <MediaForm
      fields={fields.filter(f => initialData?.id ? true : f.name !== 'id')}
      onFinish={handleSubmit}
      loading={isLoading}
      submitText={initialData?.id ? t('update') : t('upload')}
      initialValues={fields.reduce((acc, f) => { if (f.initialValue !== undefined) acc[f.name] = f.initialValue; return acc; }, {})}
      fileType="image"
    />
  );
};

export default ImagesForm;
