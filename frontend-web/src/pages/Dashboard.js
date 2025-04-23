import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as turf from "@turf/turf";
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/Dashboard.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Dashboard = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const searchPopup = useRef(null);
  const [selectedDay, setSelectedDay] = useState(localStorage.getItem("selectedDay") || "monday");
  
  useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for an address",
      zoom: 14,
    });

    if (map.current) return;

    const containerElement = mapContainer.current;

    map.current = new mapboxgl.Map({
      container: containerElement,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-77.12, 38.77],
      zoom: 11.5,
    })
    
    map.current.addControl(geocoder, 'top-left');

    geocoder.on('result', (e) => {
      // Remove previous search popup if it exists
      if (searchPopup.current) {
        searchPopup.current.remove();
      }
      const point = turf.point([e.result.center[0], e.result.center[1]]);
    
      let matchedWorkArea = null;
    
      map.current.getStyle().layers.forEach((layer) => {
        if (!layer.id.startsWith("polygon-") || layer.id.includes("-border") || layer.id.includes("-label")) return;
    
        const source = map.current.getSource(layer.id);
        if (!source) return;
    
        const sourceData = source._data;
        if (!sourceData) return;
    
        const polygon = turf.polygon(sourceData.geometry.coordinates);
    
        if (turf.booleanPointInPolygon(point, polygon)) {
          matchedWorkArea = sourceData.properties.label;
        }
      });
    
      if (matchedWorkArea) {
        searchPopup.current = new mapboxgl.Popup()
          .setLngLat(e.result.center)
          .setHTML(`<div style="font-size: 20px; font-weight: bold; padding: 10px 10px;">${matchedWorkArea}</div>`)
          .addTo(map.current);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      map.current.resize();
    });

    if (containerElement) {
      resizeObserver.observe(containerElement);
    }

    return () => {
      if (containerElement) {
        resizeObserver.unobserve(containerElement);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const res = await fetch(`/api/data/polygons/grouped?day=${selectedDay}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        const existingLayers = map.current.getStyle().layers?.map(l => l.id).filter(id => id.startsWith("polygon-")) || [];
        existingLayers.forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
        });

        existingLayers.forEach(id => {
          const sourceId = id.replace(/-label|-border$/, '');
          if (map.current.getSource(sourceId)) {
            try {
              map.current.removeSource(sourceId);
            } catch (e) {
              console.warn(`Could not remove source ${sourceId}:`, e);
            }
          }
        });

        data.forEach((group, groupIndex) => {
          group.polygons.forEach((poly, i) => {
            const id = `polygon-${groupIndex}-${i}`;
            if (!poly.coordinates || poly.coordinates.length === 0) return;

            const color = `hsl(${(groupIndex * 36) % 360}, 70%, 60%)`;

            map.current.addSource(id, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [poly.coordinates],
                },
                properties: {
                  label: group.workAreaNumber.replace(/^0+/, ""),
                  color,
                },
              },
            });

            map.current.addLayer({
              id,
              type: "fill",
              source: id,
              paint: {
                "fill-color": ["get", "color"],
                "fill-opacity": 0.5,
              },
            });

            map.current.addLayer({
              id: `${id}-border`,
              type: "line",
              source: id,
              paint: {
                "line-color": ["get", "color"],
                "line-width": 1.5,
              },
            });

            map.current.addLayer({
              id: `${id}-label`,
              type: "symbol",
              source: id,
              layout: {
                "text-field": ["get", "label"],
                "text-size": 12,
                "text-anchor": "center",
              },
              paint: {
                "text-color": "#000",
              },
            });
          });
        });
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
    <div style={{ fontFamily: "Roboto, sans-serif", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ borderBottom: "1px solid #ddd", padding: "1rem 2rem", fontSize: "1.8rem", fontWeight: "500", textAlign: "left" }}>
        Dashboard
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1rem",marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 500, fontSize: "1.2rem" }}>Filter by day</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  localStorage.setItem("selectedDay", day);
                }}
                style={{
                  padding: "0.6rem 1.2rem",
                  fontSize: ".8rem",
                  backgroundColor: selectedDay === day ? "#007bff" : "#f0f0f0",
                  color: selectedDay === day ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={mapContainer}
        style={{
          flexGrow: 1,
          margin: "0 1rem 1rem 1rem",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};

export default Dashboard;