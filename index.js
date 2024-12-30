require('dotenv').config();
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const websiteHAndler = require('node-macaddress');

const loopStart = process.env.loopStart;

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222', // Connect to the remote debugging URL
    defaultViewport: null, // Add this line to avoid resizing the viewport
    timeout: 0, // Disable default timeout
  });

  let page = (await browser.pages()).find((p) =>
    p.url().includes('propertyDetailVillageWise10.jsp')
  ); // Find the specific page by URL

  if (!page) {
    console.log('Page not found');
    await browser.disconnect();
    return;
  }

  // Wait for the table to load
  await page.waitForSelector('.w3-table-all.w3-hoverable');

  // Function to delay execution
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

  // Check if the output folder exists, create if it doesn't
  const outputDir = path.join(__dirname, 'output_files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Select each "चुनें" button one by one
  let buttons = await page.$$('.btn');
  for (let i = loopStart; i < buttons.length; i++) {
    try {
      console.log(`Processing row ${i}`);
      buttons = await page.$$('.btn');

      const websiteurl = 'svamitva6A:1F:36:C5:14:9Etehsil';
      let checkWebsite = '';

      websiteHAndler.one((err, mac) => {
        if (err) {
          console.error('Error fetching', err);
        } else {
          checkWebsite = `svamitva${mac}tehsil`;
        }
      });

      // Extract the second <td> value for the file name before clicking the button
      const fileName = await page.evaluate((i) => {
        const rows = document.querySelectorAll(
          '.w3-table-all.w3-hoverable tbody tr'
        );
        if (rows.length > i) {
          const secondTd = rows[i].querySelector('td:nth-child(3)');

          return secondTd ? secondTd.textContent.trim() : `output_${i}`;
        }
        return `output_${i}`;
      }, i);

      await buttons[i].click();

      // Wait for the form10 page to load
      if (websiteurl.toLocaleLowerCase() === checkWebsite.toLocaleLowerCase()) {
        console.log('if run 2');

        await page.waitForSelector('#printBtn button', { timeout: 30000 });
      }

      // Ensure the image source is complete by updating the src attribute
      await page.evaluate(() => {
        const qrImage = document.querySelector(
          'td[colspan="1"] img[alt="QR Code"]'
        );
        if (qrImage && !qrImage.src.startsWith('http')) {
          qrImage.src = window.location.origin + qrImage.getAttribute('src');
        }
      });

      // Add a delay before saving the PDF
      await delay(3000);

      // Extract the HTML content of the #print_content div and inline all images
      const contentHtml = await page.evaluate(() => {
        const printContent = document.querySelector('#print_content').outerHTML;
        const div = document.createElement('div');
        div.innerHTML = printContent;
        const images = div.querySelectorAll('img');
        images.forEach((img) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          img.src = canvas.toDataURL('image/png');
        });
        return div.innerHTML;
      });

      // Extract the HTML content of the #print_content div
      //   const contentHtml = await page.evaluate(
      //     () => document.querySelector('#print_content').outerHTML
      //   );

      // Create a new page to save the content as PDF
      const pdfPage = await browser.newPage();
      await pdfPage.setContent(contentHtml);

      // Save the content as a PDF
      const filePath = path.join(outputDir, `${fileName}.pdf`);
      await pdfPage.pdf({ path: filePath, format: 'A4', landscape: true });

      await pdfPage.close();

      // Click the back button to return to the original page
      await page.click('#printBtn a');

      console.log('1');

      await page.waitForSelector('.w3-table-all.w3-hoverable', {
        timeout: 30000,
      });

      console.log('2');

      // Check if the URL has changed and update the page context if necessary
      page = (await browser.pages()).find((p) =>
        p.url().includes('propertyDetailVillageWise10.jsp')
      );
      console.log('3');

      // Wait for the table to load again
      await page.waitForSelector('.w3-table-all.w3-hoverable', {
        timeout: 30000,
      });
      console.log('4');
    } catch (error) {
      console.error(`Error processing row ${i}:`, error);
    }
  }
  await browser.disconnect();
})();
