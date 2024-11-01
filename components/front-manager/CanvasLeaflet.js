import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import * as L from 'leaflet';

export class CanvasLayer extends L.Layer {
  constructor() {
    super();
    this.canvas = null;
  }

  onAdd(map) {
    this.canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');
    this.ctx = this.canvas.getContext('2d');
    console.log("onAdd "+ map[0]+ map[1])
    
    // Set canvas size and style
    // Hide the map initially
    this.redraw(map);
    this.canvas.style.position = 'absolute';
    // this.canvas.style.width = '100%';
    // this.canvas.style.height = '100%';
    // this.canvas.style.zIndex = 10000000;
    this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    map.getPanes().overlayPane.appendChild(this.canvas);
    console.log("onAdd second "+ map.getPanes()[0] +map.getPanes()[1])
  }
  
  onRemove(map) {
    console.log("onRemove "+ map[0]+ map[1])
    map.getPanes().overlayPane.removeChild(this.canvas);
    map.off('resize', this.redraw.bind(this));
  }
  
  setSize(size) {
    console.log("setSize "+ size)
    this.canvas.width = size.x;
    this.canvas.height = size.y;
  }
  
  redraw(map) {
    const leftBottomCorner = map.latLngToContainerPoint(map.getBounds().getSouthWest());
    // Set the canvas position to align with the map
    console.log("redraw "+ leftBottomCorner.x + "  "+leftBottomCorner.y)
    this.setSize(map.getSize());
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0 +leftBottomCorner.x, 0+leftBottomCorner.y - this.canvas.height, this.canvas.width, this.canvas.height);
  }

  revealArea(point, scale) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.calculateRadius(scale), 0, Math.PI * 2, true);
    this.ctx.fill();
  }
  calculateRadius(scale) {
    // Cap radius based on the scale thresholds
    const minRadius = 50;
    const maxRadius = 200;
    const minScale = 500;
    const maxScale = 200000;
  
    // If scale is greater than the max scale, cap radius to maxRadius
    if (scale >= maxScale) return maxRadius;
  
    // If scale is less than the min scale, cap radius to minRadius
    if (scale <= minScale) return minRadius;
  
    // Linear interpolation to smoothly adjust radius based on scale
    const ratio = (scale - minScale) / (maxScale - minScale);
    const radius = minRadius + ratio * (maxRadius - minRadius);
  
    return radius;
  };


}