import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98.35, 39.5], // Default center (USA)
      zoom: 4,
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapView;