const express = require('express');
const app = express();
const port = 3000;
const fs = require("fs-extra");
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const data = require('./data.json');
const path = require("path");
const datauri = require('datauri');


const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), 'views', `${templateName}.hbs`);
  const html = await fs.readFile(filePath, 'utf8');
  return hbs.compile(html)(data);
};

hbs.registerHelper("json", function(obj)
{
  return JSON.stringify(obj);
});


(async () => {
  // launch a new chrome instance
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/opt/homebrew/bin/chromium',  // only for M1 x86 chip
  })
  
  // create a new page
  const page = await browser.newPage()
  
  // set your html as the pages content
  const html = fs.readFileSync(`${__dirname}/views/layout.hbs`, 'utf8')
  
  const content = await compile('layout', data);
  await page.setContent(content)
  // create a pdf buffer
  const pdfBuffer = await page.pdf({
    format: 'A4'
  })
  
  
  // or a .pdf file
  await page.pdf({
    format: 'A4',
    path: `${__dirname}/test.pdf`
  })
  
  // close the browser
  await browser.close()
  const pdfdatauri = await datauri('test.pdf');
})()


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.send('index')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
