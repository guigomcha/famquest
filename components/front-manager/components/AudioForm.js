import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Typography,
  message
} from "antd";
import { InboxOutlined, AudioOutlined, LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { uploadAttachment, addReferenceInDB, updateInDB } from "../functions/db_manager_api";
import { GlobalMessage } from "../functions/components_helper";
import { useTranslation } from "react-i18next";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title } = Typography;

const AudioForm = ({ initialData, refType, handledFinished }) => {
  const { t } = useTranslation();
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRecorder = useRef(null);

  const toggleAudioRecording = async () => {
    setAudioOpened(!audioOpened);
    if (audioOpened) {
      audioRecorder.current?.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioRecorder.current = recorder;
    setAudioStream(stream);

    recorder.ondataavailable = (e) => setAudioBlob(e.data);
    recorder.start();
  };

  const handleFinish = async (values) => {
    setIsLoading(true);
    const dataToUpload = audioBlob || values.file?.file.originFileObj;

    if (!dataToUpload) {
      GlobalMessage(t("formNotValid"), "error");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...values,
      datetime: values.datetime.format("YYYY-MM-DD") + "T00:00:00Z",
      name: values.name || dataToUpload.name || t("autoName"),
      description: values.description || t("autoDescription"),
      contentType: dataToUpload?.type || "audio/ogg"
    };

    if (initialData?.id) {
      payload.id = initialData.id;
      const updated = await updateInDB(payload, "attachment");
      if (!updated) {
        GlobalMessage(t("internalError"), "error");
      } else {
        GlobalMessage(t("actionCompleted"), "info");
      }
      setIsLoading(false);
      handledFinished("done");
      return;
    }

    const attachment = await uploadAttachment(dataToUpload, payload);
    if (attachment) {
      await addReferenceInDB(attachment.id, initialData.refId, refType, "attachment");
      GlobalMessage(t("actionCompleted"), "info");
    } else {
      GlobalMessage(t("internalError"), "error");
    }

    setIsLoading(false);
    handledFinished("done");
  };

  return (
    <Card size="small" style={{ maxWidth: 600, margin: "auto" }}>
      <Spin spinning={isLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}> 
        <Form layout="vertical" onFinish={handleFinish} initialValues={{
          name: initialData?.name,
          description: initialData?.description,
          datetime: initialData?.datetime ? dayjs(initialData.datetime.split("T")[0]) : dayjs()
        }}>
          {initialData?.id && (
            <Form.Item label="ID" name="id">
              <Input readOnly />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t("name")} name="name">
                <Input placeholder={t("editName")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("datetime")} name="datetime" rules={[{ required: true }]}> 
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t("description")} name="description">
            <TextArea rows={4} placeholder={t("editDescription")} maxLength={500} />
          </Form.Item>

          {!initialData?.id && (
            <>
              <Form.Item label={t("selectFromDevice")} name="file" valuePropName="file">
                <Upload beforeUpload={() => false} accept="audio/*" maxCount={1}>
                  <Button icon={<InboxOutlined />}>{t("selectFromDevice")}</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button icon={<AudioOutlined />} onClick={toggleAudioRecording}>
                  {t("audioControl")}
                </Button>
                {audioOpened && <span style={{ color: "red", marginLeft: 10 }}>{t("recording")}</span>}
              </Form.Item>
            </>
          )}

          <Form.Item>
            {audioBlob && (
              <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: "100%" }} />
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {initialData?.id ? t("update") : t("upload")}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default AudioForm;
