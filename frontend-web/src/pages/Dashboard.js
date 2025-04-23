import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/Dashboard.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Dashboard = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedDay, setSelectedDay] = useState(localStorage.getItem("selectedDay") || "monday");

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-77.0369, 38.9072],
      zoom: 9,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const generateColor = (index) => {
      const baseColors = [
        "rgba(31, 119, 180, 0.6)", "rgba(44, 160, 44, 0.6)", "rgba(255, 127, 14, 0.6)", "rgba(214, 39, 40, 0.6)", "rgba(148, 103, 189, 0.6)",
        "rgba(140, 86, 75, 0.6)", "rgba(227, 119, 194, 0.6)", "rgba(127, 127, 127, 0.6)", "rgba(188, 189, 34, 0.6)", "rgba(23, 190, 207, 0.6)"
      ];
      return baseColors[index % baseColors.length];
    };

    const fetchPolygons = async () => {
      console.log("Map loaded or day changed, fetching polygons...");

      // Remove existing polygon layers and sources only if map style is loaded
      if (map.current.isStyleLoaded()) {
        const layersToRemove = map.current.getStyle().layers
          ?.map(l => l.id)
          .filter(id => id.startsWith("polygon-")) || [];

        layersToRemove.forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
        });

        layersToRemove.forEach(id => {
          if (map.current.getSource(id)) {
            map.current.removeSource(id);
          }
        });
      }

      try {
        const res = await fetch(`/api/data/polygons/grouped?day=${selectedDay}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log("Fetched polygons:", data);

        if (Array.isArray(data)) {
          data.forEach((group, index) => {
            if (!Array.isArray(group.polygons)) return;

            group.polygons.forEach((poly, i) => {
              if (!poly.coordinates || poly.coordinates.length === 0) return;

              const id = `polygon-${index}-${i}`;

              // Skip if source already exists
              // Removed the check: if (map.current.getSource(id)) return;

              map.current.addSource(id, {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [poly.coordinates],
                  },
                  properties: {
                    name: poly.name,
                    color: generateColor(index),
                  },
                },
              });

              if (!map.current.getLayer(id)) {
                map.current.addLayer({
                  id: id,
                  type: "fill",
                  source: id,
                  paint: {
                    "fill-color": ["get", "color"],
                    "fill-opacity": 0.4,
                  },
                });
              }

              if (!map.current.getLayer(`${id}-border`)) {
                map.current.addLayer({
                  id: `${id}-border`,
                  type: "line",
                  source: id,
                  paint: {
                    "line-color": ["get", "color"],
                    "line-width": 2,
                  },
                });
              }

              if (!map.current.getLayer(`${id}-label`)) {
                map.current.addLayer({
                  id: `${id}-label`,
                  type: "symbol",
                  source: id,
                  layout: {
                    "text-field": group.workAreaNumber.replace(/^0+/, ""),
                    "text-size": 12,
                    "text-anchor": "center",
                  },
                  paint: {
                    "text-color": "#000",
                  },
                });
              }
            });
          });
        }
      } catch (err) {
        console.error("Error fetching polygons:", err);
      }
    };

    if (map.current.isStyleLoaded()) {
      fetchPolygons();
    } else {
      map.current.once("load", fetchPolygons);
    }
  }, [selectedDay]);

  return (
    <div 
      style={{
        height: "calc(100vh - 20px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "Roboto, sans-serif"
        
      }}>
      <div style={{
        borderBottom: "1px solid #ddd",
        padding: "1rem",
        fontSize: "1.5rem",
        fontWeight: "500",
        textAlign: "left"
      }}>
        Dashboard
      </div>
  
      <div style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <div style={{ fontWeight: 500 }}>Filter by day</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                localStorage.setItem("selectedDay", day);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: selectedDay === day ? "#007bff" : "#f0f0f0",
                color: selectedDay === day ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {day.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      </div>
  
      <div
        ref={mapContainer}
        style={{
          flexGrow: 1,
          height: "100%",
          width: "calc(100% - 2rem)",
          maxWidth: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          boxSizing: "border-box",
          
          margin: "0 1rem",
        }}
      />
    </div>
  );
};

export default Dashboard;