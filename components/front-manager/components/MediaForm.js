import React, { useState } from 'react';
import { Form, Input, DatePicker, Button, Spin, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * MediaForm: Componente base para formularios multimedia (audio, imagen, video).
 * Props:
 *  - fields: [{name, label, type, required, placeholder, initialValue, readOnly, options}]
 *  - onFinish: función de submit (valores del formulario)
 *  - loading: boolean
 *  - submitText: string
 *  - fileType: 'audio' | 'image' | 'video' | 'any'
 *  - children: renderiza contenido adicional
 */
const MediaForm = ({ fields, onFinish, loading, submitText, initialValues, fileType, children }) => {
  const [fileList, setFileList] = useState([]);

  const beforeUpload = (file) => {
    if (fileType && !file.type.startsWith(fileType)) {
      message.error(`Solo se permiten archivos de tipo ${fileType}`);
      return Upload.LIST_IGNORE;
    }
    setFileList([file]);
    return false;
  };

  const handleFinish = (values) => {
    onFinish({ ...values, file: fileList[0] });
  };

  return (
    <Spin spinning={loading} tip="Cargando...">
      <Form
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        {fields.map(field => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `Campo obligatorio` }]}
          >
            {field.type === 'date' ? (
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            ) : field.type === 'textarea' ? (
              <TextArea rows={field.rows || 4} placeholder={field.placeholder} style={{ resize: 'none', maxHeight: 200 }} readOnly={field.readOnly} />
            ) : field.type === 'select' && field.options ? (
              <select name={field.name} defaultValue={field.initialValue} disabled={field.readOnly} style={{ width: '100%', padding: 8 }}>
                {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <Input type={field.type} placeholder={field.placeholder} readOnly={field.readOnly} />
            )}
          </Form.Item>
        ))}
        <Form.Item label="Archivo" required>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={beforeUpload}
            fileList={fileList}
            onRemove={() => setFileList([])}
            accept={fileType ? `${fileType}/*` : undefined}
            showUploadList={true}
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Arrastra o haz clic para seleccionar el archivo</p>
          </Dragger>
        </Form.Item>
        {children}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>{submitText || 'Enviar'}</Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default MediaForm;
