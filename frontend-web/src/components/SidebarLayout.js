// src/components/SidebarLayout.js
import React, { useState, useRef } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarLayout = ({ children }) => {
  const [open, setOpen] = useState(() => {
    const storedOpen = localStorage.getItem("drawerOpen");
    return storedOpen === null ? true : storedOpen === "true";
  });
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const savedWidth = localStorage.getItem("drawerWidth");
    const drawerOpen = localStorage.getItem("drawerOpen");
    if (drawerOpen === "false") return 0;
    return savedWidth ? parseInt(savedWidth, 10) : 200;
  });
  const [resizing, setResizing] = useState(false);
  const buttonRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  const drawerRef = useRef();
  const resizerRef = useRef();

  React.useEffect(() => {
    if (resizerRef.current) {
      resizerRef.current.style.left = `${drawerWidth - 2}px`;
    }
    if (buttonRef.current) {
      buttonRef.current.style.left = `${drawerWidth + 8}px`;
    }
  }, [drawerWidth]);

  if (isAuthPage) return children;

  const toggleDrawer = () => {
    const newOpenState = !open;
    if (!newOpenState) {
      setDrawerWidth(0);
      localStorage.setItem("drawerWidth", 0);
      if (buttonRef.current) buttonRef.current.style.left = `8px`;
    } else {
      const restoredWidth = 180;
      setDrawerWidth(restoredWidth);
      localStorage.setItem("drawerWidth", restoredWidth);
      if (drawerRef.current) {
        drawerRef.current.style.width = `${restoredWidth}px`;
        const paper = drawerRef.current.querySelector(".MuiDrawer-paper");
        if (paper) paper.style.width = `${restoredWidth}px`;
      }
      if (buttonRef.current) buttonRef.current.style.left = `${restoredWidth + 8}px`;
    }
    setOpen(newOpenState);
    localStorage.setItem("drawerOpen", newOpenState);
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
                if (buttonRef.current) buttonRef.current.style.left = `8px`;
                localStorage.setItem("drawerOpen", false);
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                setResizing(false);
                return;
              } else {
                if (!open) setOpen(true);
                newWidth = Math.min(300, Math.max(180, newWidth));
              }

              drawerRef.current.style.width = `${newWidth}px`;
              drawerRef.current.querySelector(".MuiDrawer-paper").style.width = `${newWidth}px`;
              resizerRef.current.style.left = `${newWidth - 2}px`;
              setDrawerWidth(newWidth);
              localStorage.setItem("drawerWidth", newWidth);
              if (buttonRef.current) buttonRef.current.style.left = `${newWidth + 8}px`;
            });
          };

          const handleMouseUp = () => {
            const finalWidth = drawerRef.current.offsetWidth;
            setDrawerWidth(finalWidth);
            localStorage.setItem("drawerWidth", finalWidth);
            if (buttonRef.current) buttonRef.current.style.left = `${finalWidth + 8}px`;
            if (open) {
              localStorage.setItem("drawerOpen", true);
            }
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