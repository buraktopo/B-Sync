// src/components/SidebarLayout.js
import React, { useState, useRef } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarLayout = ({ children }) => {
  const [open, setOpen] = useState(() => {
    const savedCollapsed = localStorage.getItem("drawerCollapsed");
    return savedCollapsed === "true" ? false : true;
  });
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const savedWidth = localStorage.getItem("drawerWidth");
    const collapsed = localStorage.getItem("drawerCollapsed") === "true";
    if (collapsed) return 0;
    return savedWidth ? parseInt(savedWidth, 10) : 200;
  });
  const [resizing, setResizing] = useState(false);
  const buttonRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const drawerRef = useRef();
  const resizerRef = useRef();

  const updateButtonPosition = (width) => {
    if (buttonRef.current) {
      buttonRef.current.style.left = `${width + 8}px`;
    }
  };

  React.useLayoutEffect(() => {
    const updateResizer = () => {
      if (resizerRef.current) {
        resizerRef.current.style.left = `${drawerWidth - 2}px`;
      }
      if (drawerRef.current) {
        drawerRef.current.style.width = `${drawerWidth}px`;
        const paper = drawerRef.current.querySelector(".MuiDrawer-paper");
        if (paper) paper.style.width = `${drawerWidth}px`;
      }
      updateButtonPosition(drawerWidth);
    };
    requestAnimationFrame(updateResizer);
  }, [drawerWidth]);

  React.useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.style.width = `${drawerWidth}px`;
      const paper = drawerRef.current.querySelector(".MuiDrawer-paper");
      if (paper) paper.style.width = `${drawerWidth}px`;
    }
    if (resizerRef.current) {
      resizerRef.current.style.left = `${drawerWidth - 2}px`;
    }
    updateButtonPosition(drawerWidth);
  }, [drawerWidth]);

  if (isAuthPage) return children;

  const toggleDrawer = () => {
    if (open) {
      setDrawerWidth(0);
      localStorage.setItem("drawerWidth", 0);
      localStorage.setItem("drawerCollapsed", "true");
      updateButtonPosition(0);
      setOpen(false);
    } else {
      const restoredWidth = 180;
      setDrawerWidth(restoredWidth);
      localStorage.setItem("drawerWidth", restoredWidth);
      localStorage.setItem("drawerCollapsed", "false");
      if (drawerRef.current) {
        drawerRef.current.style.width = `${restoredWidth}px`;
        const paper = drawerRef.current.querySelector(".MuiDrawer-paper");
        if (paper) paper.style.width = `${restoredWidth}px`;
      }
      updateButtonPosition(restoredWidth);
      setOpen(true);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
  ];


  return (
    <Box display="flex" sx={{ userSelect: resizing ? "none" : "auto" }}>
      <Drawer
        ref={drawerRef}
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            backgroundColor: "#031737",
            color: "white",
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 0.2s ease",
            willChange: "width",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <List>
            {navItems.map((item) => (
              <Tooltip title={open ? "" : item.label} placement="right" key={item.label}>
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  sx={{ cursor: "pointer", width: "100%" }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center" }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.label} />}
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Resizer */}
      <Box
        ref={resizerRef}
        onMouseDown={(e) => {
          setResizing(true);
          const startX = e.clientX;
          const startWidth = drawerRef.current.offsetWidth;
          let animationFrame;

          const handleMouseMove = (moveEvent) => {
            if (!open) return; // Prevent resizing when drawer is collapsed
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
              let newWidth = startWidth + moveEvent.clientX - startX;

              if (newWidth <= 100) {
                setOpen(false);
                newWidth = 0;
                drawerRef.current.style.width = `0px`;
                drawerRef.current.querySelector(".MuiDrawer-paper").style.width = `0px`;
                updateButtonPosition(0);
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                setResizing(false);
                return;
              } else {
                if (!open) setOpen(true);
                newWidth = Math.min(300, Math.max(180, newWidth));
              }

              updateButtonPosition(newWidth);
              drawerRef.current.style.width = `${newWidth}px`;
              drawerRef.current.querySelector(".MuiDrawer-paper").style.width = `${newWidth}px`;
              resizerRef.current.style.left = `${newWidth - 2}px`;
              setDrawerWidth(newWidth);
              localStorage.setItem("drawerWidth", newWidth);
            });
          };

          const handleMouseUp = () => {
            const finalWidth = drawerRef.current.offsetWidth;
            setDrawerWidth(finalWidth);
            localStorage.setItem("drawerWidth", finalWidth);
            updateButtonPosition(finalWidth);
            setResizing(false);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
          };

          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", handleMouseUp);
        }}
        sx={{
          width: 4,
          cursor: "col-resize",
          zIndex: 1301,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: drawerWidth - 2,
        }}
      />
      <Box flexGrow={1}>
        <IconButton
          ref={buttonRef}
          onClick={toggleDrawer}
          sx={{
            position: "absolute",
            top: 16,
            left: `${drawerWidth + 8}px`,
            zIndex: 1302,
            transition: "left 0.2s ease",
          }}
        >
          <MenuIcon sx={{ color: "#062e60" }} />
        </IconButton>
        <Box mt={6} p={3}>{children}</Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout;