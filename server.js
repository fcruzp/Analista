const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir archivos estáticos desde la carpeta raíz o de construcción
app.use(express.static(path.join(__dirname, '.')));

// Todas las rutas deben redirigir al index.html para soportar el enrutamiento de la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de Analista+ corriendo en el puerto ${PORT}`);
});