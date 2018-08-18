
let iconv = require('iconv-lite');

require("child_process").exec("echo äëïöüT",
                              { encoding: 'buffer' },
                              function(err, stdout, stderr) {
   // `stdout` and `stderr` are Buffer instances
  console.dir(stdout);
  //testiData = iconv.decode(Buffer.from(stdout)),'utf8';
  buf = iconv.encode("testi ä ö å y ", 'win1251');
  console.log("win1251",buf);
  buf2 = iconv.encode("testi ä ö å y ", 'utf8');
  console.log("utf8",buf2);
  buf3 = iconv.encode("testi ä ö å y ", 'utf-16');
  console.log("utf-16'",buf3);
  buf4 = iconv.encode("testi ä ö å y ", 'ISO-8859-4');
  console("ISO-8859-4",buf4);
  console.log("testiData")
});