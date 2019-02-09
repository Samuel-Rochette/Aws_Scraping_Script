const fs = require("fs");
const scrape = require("website-scraper");
const mime = require("mime-types");
const AWS = require("aws-sdk");

global.XMLHttpRequest = require("xhr2");

AWS.config.update({
  accessKeyId: "....",
  secretAccessKey: "....",
  region: "us-west-2"
});

let s3 = new AWS.S3();

const options = {
  urls: ["https://www.yahoo.com/"],
  directory: __dirname + "/tmp/yahoo"
};

function processFiles(directory) {
  fs.readdir(directory, { withFileTypes: true }, (err, filesReturned) => {
    for (let i = 0; i < filesReturned.length; i += 1) {
      let look = filesReturned[i].split(".");

      if (fs.lstatSync(directory + "/" + filesReturned[i]).isDirectory()) {
        processFiles(directory + "/" + filesReturned[i]);
      } else {
        let key = (directory + "/" + filesReturned[i]).slice(__dirname.length);
        fs.readFile("." + key, "binary", (err, data) => {
          if (err) {
            console.log(err);
          }

          let params = {
            Body: data,
            Bucket: "bucket_name",
            Key: key,
            ContentType: mime.lookup(look[1]) || "text/plain",
            ACL: "public-read"
          };

          s3.putObject(params, function(err, data) {
            if (err) {
              console.log(err, err.stack);
            } else {
              console.log(data);
            }
          });
        });
      }
    }
  });
}

scrape(options, (error, result) => {
  processFiles(options.directory);
});
