import React, { useEffect, useState, useRef } from "react";
import { Drawer } from "antd";

const SlideMenu = ({ component }) => {
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(300); // Initial height of the Drawer
  const dragRef = useRef(null);

  const onClose = () => {
    setOpen(false);
    component = null;
  };

  const startDragging = (e) => {
    const initialY = e.clientY;
    const initialHeight = height;

    const onMouseMove = (event) => {
      const newHeight = initialHeight - (event.clientY - initialY);
      if (newHeight >= 100 && newHeight <= window.innerHeight - 50) {
        setHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
          body: { position: "relative", width: "100%", height: "100%", background: "green", padding: 0}
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={startDragging}
          style={{
            height: "70%",
            background: "red",
            cursor: "row-resize",
            top: 0,
            width: "100%",
            padding: 0,
            zIndex: 10,
          }}
        >{component}</div>
      </Drawer>
    </>
  );
};

export default SlideMenu;