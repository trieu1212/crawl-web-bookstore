const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request-promise");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
async function crawl(url,page) {
  request(
    `https://bookbuy.vn/sach/${url}?Page=${page}`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let data = [];
        $(".product-item").each((i, el) => {
          const name = $(el).find(".t-view a").text().trim();
          const authors = $(el)
            .find(".au-view a")
            .map((i, el) => $(el).text().trim())
            .get();
          const author = authors.join(", ");
          const price = $(el).find(".p-view .real-price").text().trim();
          let imageUrl = $(el).find(".img-view a img").attr("src");
          if (imageUrl) {
            imageUrl = "https://bookbuy.vn" + imageUrl;
          }
          const category = url.toString().split("-").join(" ");
          data.push({ name, author, price, imageUrl, category });
        });
        const folderName = `./${url}`;
        if (!fs.existsSync(folderName)) { 
          fs.mkdirSync(folderName); 
        }
        const csvWriter = createCsvWriter({
          path: `${folderName}/${url}_${page}.csv`,
          header: [
            { id: "name", title: "Tên sách" },
            { id: "author", title: "Tác giả" },
            { id: "price", title: "Giá" },
            { id: "imageUrl", title: "URL hình ảnh" },
            { id: "category", title: "Thể loại" }
          ],
        });
    
        csvWriter.writeRecords(data);
      }
    }
  );
}
async function crawlManga(page) {
    request(
      `https://bookbuy.vn/truyen-tranh/P1${page}`,
      (error, response, html) => {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          let data = [];
          $(".product-item").each((i, el) => {
            const name = $(el).find(".t-view a").text().trim();
            const authors = $(el)
              .find(".au-view a")
              .map((i, el) => $(el).text().trim())
              .get();
            const author = authors.join(", ");
            const price = $(el).find(".p-view .real-price").text().trim();
            let imageUrl = $(el).find(".img-view a img").attr("src");
            if (imageUrl) {
              imageUrl = "https://bookbuy.vn" + imageUrl;
            }
            const category = 'Truyện tranh';
            data.push({ name, author, price, imageUrl, category });
          });
          const folderName = `./truyen-tranh`;
          if (!fs.existsSync(folderName)) { 
            fs.mkdirSync(folderName); 
          }
          const csvWriter = createCsvWriter({
            path: `${folderName}/truyentranh_${page}.csv`,
            header: [
              { id: "name", title: "Tên sách" },
              { id: "author", title: "Tác giả" },
              { id: "price", title: "Giá" },
              { id: "imageUrl", title: "URL hình ảnh" },
              { id: "category", title: "Thể loại" }
            ],
          });
      
          csvWriter.writeRecords(data);
        }
      }
    );
}
async function main() {
  for (let i = 1; i <= 20; i++) {
    try {
        await crawl('sach-kinh-te',i)
        await crawl('van-hoc',i)
        await crawl('sach-ky-nang-song',i)
        await crawl('sach-teen',i);
        await crawl('sach-ngoai-ngu',i);
        await crawl('sach-truyen-thieu-nhi',i)
        await crawl('sach-bach-khoa-tri-thuc',i)
        await crawl('sach-chuyen-nganh',i)
        await crawl('language-learning',i)
        await crawl('sach-to-mau-danh-cho-nguoi-lon',i)
        await crawl('sach-triet-hoc',i)
        await crawlManga(i);
        console.log("Đã crawl xong trang" + i);
    } catch (error) {
      console.log(`Lỗi khi crawl trang ${i}: ${error}`);
    }
  }
}
main();
