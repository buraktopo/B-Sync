import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Dashboard = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedDay, setSelectedDay] = useState(localStorage.getItem("selectedDay") || "monday");

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-77.0369, 38.9072],
      zoom: 9,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const generateColor = (index) => {
      const baseColors = [
        "#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
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
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
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
      <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default Dashboard;