const minecraftColorsToHtml: { [key: string]: string } = {
    '0': '#000000', // Black
    '1': '#0000AA', // Dark Blue
    '2': '#00AA00', // Dark Green
    '3': '#00AAAA', // Dark Aqua
    '4': '#AA0000', // Dark Red
    '5': '#AA00AA', // Dark Purple
    '6': '#FFAA00', // Gold
    '7': '#AAAAAA', // Gray
    '8': '#555555', // Dark Gray
    '9': '#5555FF', // Blue
    'a': '#55FF55', // Green
    'b': '#55FFFF', // Aqua
    'c': '#FF5555', // Red
    'd': '#FF55FF', // Light Purple
    'e': '#FFFF55', // Yellow
    'f': '#FFFFFF', // White
  };
  
  function m2h(input: string): string {
    const colorCode = input[1]; // Assuming input starts with '§'
    const htmlColor = minecraftColorsToHtml[colorCode] || '#FFFFFF'; // Default to white if code not found
    return `<span style="color: ${htmlColor}">${input}</span>`;
  }
  
  export default m2h;
  