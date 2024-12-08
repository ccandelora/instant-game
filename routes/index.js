const express = require('express');
    const router = express.Router();

    // Example route for home page
    router.get('/', (req, res) => {
      res.send('Welcome to Instant Arcade!');
    });

    module.exports = router;
