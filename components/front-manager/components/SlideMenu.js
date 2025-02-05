import React, { useEffect, useState, useRef } from "react";
import { Drawer } from "antd";
import { ColumnHeightOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";


const SlideMenu = ({ component, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(300); // Initial height of the Drawer
  const dragRef = useRef(null);

  const onClose = () => {
    setOpen(false);
    component = null;
    handledFinished(null);
    console.info("should have closed it")
  };

  const startDragging = (e) => {
    const initialY = e.clientY || e.touches[0].clientY;
    const initialHeight = height;

    const onMove = (event) => {
      const currentY = event.clientY || event.touches[0].clientY;
      const newHeight = initialHeight - (currentY - initialY);
      if (newHeight >= 100 && newHeight <= window.innerHeight - 50) {
        setHeight(newHeight);
      }
    };

    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  };

  useEffect(() => {
    setOpen(component != null);
  }, [component]);

  return (
    <>
      <Drawer
        placement="bottom"
        height={height} // Use height state to control Drawer height
        onClose={onClose}
        open={open}
        closable={false}
        styles={{
          body: { position: "relative", width: "100%", height: "100%", padding: 0}
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={startDragging}
          onTouchStart={startDragging} // Handle touch interactions
          style={{
            position: "sticky", // Keeps it floating at the top of the Drawer
            top: 0, // Adjust as needed for placement
            zIndex: 10, // Ensures it stays above content
            height: "30px",
            cursor: "row-resize",
            width: "100%",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ColumnHeightOutlined style={{height: "30px"}}/>
        </div>
        <div>{component}</div>
      </Drawer>
    </>
  );
};

export default SlideMenu;
