import React, { useEffect, useState } from 'react';
import { Button, Drawer, Radio, Space } from 'antd';
const SlideMenu = ({component}) => {
  const [open, setOpen] = useState(true);
  const onClose = () => {
    setOpen(false);
    component = null;
  };
  useEffect(() => {
    setOpen(component != null );
  }, [component])
  return (
    <>
      <Drawer
        title="Drawer with extra actions"
        placement="bottom"
        width={500}
        onClose={onClose}
        open={open}
      >
        {component}
      </Drawer>
    </>
  );
};
export default SlideMenu;