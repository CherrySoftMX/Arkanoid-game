export const calculateCoordsToCenterItem = ({
  windowWidth,
  windowHeight,
  objectWidth,
  objectHeight,
}) => {
  const xCoord = (windowWidth - objectWidth) / 2;
  const yCoord = (windowHeight - objectHeight) / 2;
  return {
    x: xCoord,
    y: yCoord,
  };
};

export const getRandomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}
