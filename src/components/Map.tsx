// @ts-nocheck
"use client";

import maplibregl, { Map as MapType, MercatorCoordinate } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type Report = {
  id: string;
  lat: number;
  lng: number;
  type: string;
};

// Demo hazard reports
const demoReports: Report[] = [
  { id: "1", lat: 19.076, lng: 72.8777, type: "High Waves" }, // Mumbai
  { id: "2", lat: 13.0827, lng: 80.2707, type: "Flooding" }, // Chennai
  { id: "3", lat: 8.52, lng: 92.43, type: "Flooding" }, // Chennai
  // "latitude": 8.52,
  // "longitude": 92.43,
  //   { id: "3", lat: 8.5241, lng: 76.9366, type: "Swell Surge" }, // Kerala
];

export default function Map3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapType | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // India bounding box (approx)
    const indiaBounds: [[number, number], [number, number]] = [
      [68.0, 6.5], // SW corner (lng, lat)
      [97.4, 35.5], // NE corner (lng, lat)
    ];

    // Initialize MapLibre focused on India
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json", // Dark style
      center: [78.9629, 20.5937], // India center
      zoom: 4.5,
      pitch: 60,
      // maxBounds: indiaBounds, // Lock map to India
      minZoom: 4,
      maxZoom: 10,
      canvasContextAttributes: { antialias: true },
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current.on("style.load", () => {
      mapRef.current!.getStyle().layers?.forEach((layer) => {
        if (layer.type === "symbol" && layer.id.includes("country")) {
          mapRef.current!.setFilter(layer.id, ["==", ["get", "name"], "India"]);
        }
      });
    });

    // Model parameters (center of India)
    const modelOrigin: [number, number] = [78.9629, 20.5937];
    const modelAltitude = 0;
    const modelRotate: [number, number, number] = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate: MercatorCoordinate =
      MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    };

    // 3D custom layer
    const customLayer: maplibregl.CustomLayerInterface = {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        // Lights
        const light1 = new THREE.DirectionalLight(0xffffff);
        light1.position.set(0, -70, 100).normalize();
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff);
        light2.position.set(0, 70, 100).normalize();
        this.scene.add(light2);

        // Load GLTF model
        const loader = new GLTFLoader();
        loader.load(
          "https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf",
          (gltf) => {
            this.scene.add(gltf.scene);
          }
        );

        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        this.renderer.autoClear = false;
      },
      render: function (gl, matrix) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(
          matrix.defaultProjectionData.mainMatrix
        );
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      },
    };

    mapRef.current.on("style.load", () => {
      mapRef.current!.addLayer(customLayer);

      // Add demo markers
      demoReports.forEach((report) => {
        const el = document.createElement("div");
        el.className = "text-white px-2 py-1 rounded text-xs shadow";
        el.textContent = report.type;

        new maplibregl.Marker(el)
          .setLngLat([report.lng, report.lat] as [number, number])
          .addTo(mapRef.current!);
      });
    });
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-[600px] rounded-lg border" />
  );
}
