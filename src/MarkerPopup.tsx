import { useState, useEffect, useRef } from "react";
import Point from "ol/geom/Point.js";
import Map from "ol/Map";
import View from "ol/View";
import { OGCMapTile } from "ol/source.js";
import { Tile as TileLayer } from "ol/layer.js";
import Overlay from "ol/Overlay";
import { toLonLat } from "ol/proj.js";
import { toStringHDMS } from "ol/coordinate.js";
import "ol/ol.css";

const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
    crossOrigin: "",
  }),
});

const MarkerPopupMap = () => {
  const popupContainerRef = useRef(null);
  const popupContentRef = useRef(null);
  const overlay = useRef<Overlay>();

  const [hdms, setHdms] = useState<string>();
  
  useEffect(() => {
    if (popupContainerRef.current) {
      overlay.current = new Overlay({
        element: popupContainerRef.current || undefined,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
    }

    // map constructor
    const map = new Map({
      layers: [rasterLayer],
      target: "markerpopupmap",
      view: new View({
        center: [0, 0], // 2d view of the map, specify where and how the user will look at the map
        zoom: 2,
      }),
      overlays: overlay.current ? [overlay.current] : [],
    });

    // Add a click handler to the map to render the popup.
    map.on("singleclick", function (evt) {
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));
      setHdms(hdms);
      overlay.current && overlay.current.setPosition(coordinate);
    });

    return () => map.setTarget(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id="markerpopupmap" style={{ width: "100vw", height: "100vh" }} />
      <div
        id="popup"
        ref={popupContainerRef}
        className="ol-popup"
        style={{ backgroundColor: "#fff" }}
      >
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content" ref={popupContentRef}>
          {hdms ? (
            <>
              <p className="ol-content">You clicked here:</p>
              &nbsp;<code>{hdms}</code>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MarkerPopupMap;
