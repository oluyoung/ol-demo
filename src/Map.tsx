import { useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const mapStyle = {
  width: "100vw",
  height: "100vh"
}

function MapView() {
  useEffect(() => {
    new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
  }, []);

  return (
    <div id="map" className="map" style={mapStyle}></div>
  );
}

export default MapView;
