export const furnitureCatalog = [
  { type: "chair", label: "Kursi", color: "#8B5E3C", size: [0.5, 0.9, 0.5] },
  { type: "table", label: "Meja", color: "#A9744F", size: [1.2, 0.7, 0.8] },
  { type: "sofa", label: "Sofa", color: "#4A6D7C", size: [1.8, 0.8, 0.9] },
  { type: "bed", label: "Kasur", color: "#D9CBB8", size: [1.6, 0.5, 2.0] },
  { type: "shelf", label: "Rak", color: "#5C4033", size: [1.0, 1.8, 0.4] },
  { type: "lamp", label: "Lampu", color: "#F2C14E", size: [0.3, 1.5, 0.3] },
];

export const getFurnitureConfig = (type) => {
  return furnitureCatalog.find((item) => item.type === type) || furnitureCatalog[0];
};
