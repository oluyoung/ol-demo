import { useState, useEffect, useRef, ChangeEvent } from "react";
import Map from "ol/Map";
import View from "ol/View";
import { OGCMapTile, OSM } from "ol/source.js";
import { Tile as TileLayer, Group } from "ol/layer.js";
import Overlay from "ol/Overlay";
import { toLonLat } from "ol/proj.js";
import { toStringHDMS } from "ol/coordinate.js";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import "ol/ol.css";

const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
    crossOrigin: "",
  }),
  properties: {
    title: 'standard'
  },
  visible: true
});

const osmHumanitarian = new TileLayer({
  source: new OSM({
    url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  }),
  properties: {
    title: 'humanitarian'
  },
  visible: false
});

const layersGroup = new Group({
  layers: [rasterLayer, osmHumanitarian],
});

const Fab = ({ open, toggle }: { open: boolean, toggle: () => void }) => (
  <button className={`drawer-fab ${open ? 'open' : ''}`} onClick={() => toggle()}>
    {open ? '<' : '>'}
  </button>
);

const MarkerPopupMap = () => {
  const popupContainerRef = useRef(null);
  const popupContentRef = useRef(null);
  const overlay = useRef<Overlay>();
  const [hdms, setHdms] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('standard');

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const onLayerViewChange = (e: ChangeEvent<HTMLInputElement>) => {
    layersGroup.getLayers().forEach((element) => {
      const title = element.get('title');
      element.setVisible(title === e.target.value);
    });
    setCurrentLayer(e.target.value);
  };

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
      layers: layersGroup,
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
    <>
      <div className="grid-1">
        <div id="markerpopupmap" style={{ width: "100vw", height: "100vh" }} />
        <div
          id="popup"
          ref={popupContainerRef}
          className="ol-popup"
          style={{ backgroundColor: "#fff" }}
        >
          <button id="popup-closer" className="ol-popup-closer"></button>
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
      <Fab open={isOpen} toggle={toggleDrawer} />
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
      >
        <div className="layer-group">
          <h1>Layer Views</h1>
          <label htmlFor="layer-standard" className="layer-view">
            <input
              type="radio"
              id="layer-standard"
              name="layerButton"
              value="standard"
              checked={currentLayer === 'standard'}
              onChange={onLayerViewChange}
              className="layer-input"
            />
            OSM Standard
          </label>
          <label htmlFor="layer-humanitarian" className="layer-view">
            <input
              type="radio"
              id="layer-humanitarian"
              name="layerButton"
              value="humanitarian"
              checked={currentLayer === 'humanitarian'}
              onChange={onLayerViewChange}
              className="layer-input"
            />
            OSM Humanitarian
          </label>
        </div>
      </Drawer>
    </>
  );
};

export default MarkerPopupMap;
