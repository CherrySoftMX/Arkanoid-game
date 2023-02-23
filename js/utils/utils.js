export const calculateCoordsToCenterItem = ({
  windowWidth,
  windowHeight,
  objectWidth,
  objectHeight,
  relativeToX = 0,
  relativeToY = 0,
}) => {
  const xCoord = relativeToX + (windowWidth - objectWidth) / 2;
  const yCoord = relativeToY + (windowHeight - objectHeight) / 2;
  return {
    x: xCoord,
    y: yCoord,
  };
};

export const getRandomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}
