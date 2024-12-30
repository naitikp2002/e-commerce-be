// Import Puppeteer and File System module
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Launch a new browser instance
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the SEBI page
  await page.goto('https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=33');

  // Type "GUJARAT" into the location input field
  await page.type('#location', 'GUJARAT');

  // Click the "GO" button
  await page.click('.go-search.go_search');

  // Wait for 3 seconds to ensure the page is fully loaded
  await new Promise(resolve => setTimeout(resolve, 3000));

  let allCardsData = [];
  let pageIndex = 1;

  while (true) {
    // Wait for the results to load
    await page.waitForSelector('.fixed-table-body.card-table');

    // Extract data from all cards on the current page
    const cardsData = await page.evaluate((pageIndex) => {
      const cards = document.querySelectorAll('.card-table-left, .card-table-left.right');
      return Array.from(cards).map((card, index) => {
        const data = { id: (pageIndex - 1) * 25 + index + 1 }; // Calculate a unique ID
        card.querySelectorAll('.card-view').forEach(view => {
          const title = view.querySelector('.title span').textContent.trim();
          const value = view.querySelector('.value span').textContent.trim();
          data[title] = value;
        });
        return data;
      });
    }, pageIndex);

    allCardsData = allCardsData.concat(cardsData);

    // Check if there is a "Next" button and click it
    const nextButton = await page.$('a[title="Next"]');
    if (nextButton) {
      await nextButton.click();
      pageIndex++;
      // Wait for the next page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      break; // Exit the loop if no "Next" button is found
    }
  }

  // Store the data in JSON format
  const jsonData = JSON.stringify(allCardsData, null, 2);
  fs.writeFileSync('RegisteredPortfolioManagers.json', jsonData);

  console.log('Data has been written to cardsData.json');

  // Close the browser
  await browser.close();
})();
