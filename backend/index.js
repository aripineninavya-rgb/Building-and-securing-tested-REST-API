require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
