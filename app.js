const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = express.Router();
const database = require('./config/database');
const bodyParser = require('body-parser');
const customHelpers = require('./custom_helper');

const exphbs = require('express-handlebars');

app.engine(
  'hbs',
  exphbs.engine({
  
    extname: '.hbs',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    handlebars: customHelpers
  })
);


app.set('view engine', 'hbs');

// app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }));
// app.set('view engine', 'hbs');

const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

mongoose.connect(database.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Connection error:', err.message);
  });

const SuperSales = require('./models/supersales');

app.get('/api/sales', async (req, res) => {
  try {
    const sales = await SuperSales.find().exec();
    res.json(sales);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/sales/:invoice_id', (req, res) => {
  const id = req.params.invoice_id;
  SuperSales.findOne({ $or: [{ _id: id }, { InvoiceID: id }] })
      .then(SuperSales => {
          if (!SuperSales) {
              return res.status(404).json({ message: 'Invoice not found' });
          }
          res.json(SuperSales);
      })
      .catch(err => res.status(500).send(err));
});

app.post('/api/sales', (req, res) => {
  const {
      InvoiceID,
      Branch,
      City,
      CustomerType,
      ProductLine,
      Name,
      Image,
      UnitPrice,
      Quantity,
      Tax5,
      Total,
      Date,
      Time,
      Payment,
      COGS,
      GrossIncome,
      Rating,
  } = req.body;

  console.log(req.body);
  SuperSales.create({
      InvoiceID,
      Branch,
      City,
      CustomerType,
      ProductLine,
      Name,
      Image,
      UnitPrice,
      Quantity,
      Tax5,
      Total,
      Date,
      Time,
      Payment,
      COGS,
      GrossIncome,
      Rating,
  })
      .then(() => SuperSales.find())
      .then(sales => res.json(sales))
      .catch(err => res.status(500).send(err));
});
app.put('/api/sales/:invoice_id', async (req, res) => {
  try {
      const id = req.params.invoice_id;
      const { CustomerType, UnitPrice } = req.body;

      if (!CustomerType || !UnitPrice) {
          return res.status(400).json({ error: 'Customer type and unit price are required fields.' });
      }

      const data = {
          CustomerType,
          UnitPrice,
          Total: UnitPrice * (req.body.Quantity || 1),
      };

      const sales = await SuperSales.findByIdAndUpdate(id, data, { new: true });

      if (!sales) {
          return res.status(404).json({ error: 'Invoice not found' });
      }

      res.send('Successfully! Invoice updated - ' + sales.Name);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/sales/:invoice_id', async (req, res) => {
  try {
    const id = req.params.invoice_id;
    const deletedSales = await SuperSales.findOneAndDelete(id).exec();
    if (!deletedSales) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.send('Successfully! Employee has been Deleted.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/viewData', async (req, res) => {
  try {
    const salesDataInfo = await SuperSales.find({}).exec(); // Fetch all data from MongoDB
    console.log(salesDataInfo.type);
    res.render('viewData', { salesData: salesDataInfo });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get('/new', (req, res) => {
  res.render('insert'); // Render the new invoice form
});

app.post('/invoices', (req, res) => {
  const newInvoice = req.body;
  console.log(newInvoice);
  SuperSales.create(newInvoice)
      .then(() => res.redirect('/viewData'))
      .catch(err => res.status(500).send(err));
});


app.post('/deleteinvoice/:invoice_id', async (req, res) => {
  try {
    const id = req.params.invoice_id;
    const deletedSales = await SuperSales.findByIdAndDelete(id).exec();
    if (!deletedSales) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.redirect('/viewData'); // Redirect to viewData page after deletion
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`App listening on port : ${port}`);
});
