const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { notFoundController } = require('./controllers/notFoundController');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '63380d2ea6e9403f5c1b938a',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', notFoundController);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
