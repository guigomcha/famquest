import React, { useState, useRef, useEffect } from "react";
import { Button } from 'antd';
import MediaForm from './MediaForm';
import { Spin, Alert } from 'antd';
import { uploadAttachment, addReferenceInDB, updateInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import '../css/classes.css';
import { useTranslation } from "react-i18next";


const AudioForm = ({ initialData, refType, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localAudioFile, setLocalAudioFile] = useState({});

  // El manejo de archivo se realiza en MediaForm
  
  // Start recording audio
  const toggleAudioRecording = async (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    setAudioOpened(!audioOpened);

    // If already recording, stop the recording
    if (audioOpened) {
      audioRecorder.current?.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      return;
    }

    // Start recording audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioRecorder.current = recorder;
    setAudioStream(stream);

    recorder.ondataavailable = (e) => setAudioBlob(e.data);
    recorder.start();
  };


  // Handle form submission and send audio file
  const handleSubmit = async (values) => {
    setIsLoading(true);
    const dataToUpload = values.file;
    values.datetime = values.datetime.format('YYYY-MM-DD') + 'T00:00:00Z';
    values.contentType = dataToUpload?.type || 'audio/ogg';
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
      fileType="audio"
    />
  );
};

export default AudioForm;
