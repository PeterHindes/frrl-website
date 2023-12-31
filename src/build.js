const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const converter = new showdown.Converter();

let articles = [];


function traverseDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
}

traverseDir('articles', (filePath) => {
    if (path.extname(filePath) === '.md') {
        let text = fs.readFileSync(filePath, 'utf8');
        let html = converter.makeHtml(text);
        // let date = path.dirname(filePath).split(path.sep).slice(-3).join('-'); // extract date from file path
        dateParts = filePath.split(path.sep).slice();
        let year = dateParts[1];
        let month = dateParts[2];
        let day = dateParts[3].split('.')[0];
        let date = `${day}-${month}-${year}`;
        let dateHtml = `<h4 class="article-date">${date}</h4>`;
        html = html.replace(/<\/h1>/, `</h1>${dateHtml}`);
        articles.push({ date: date.split('-'), content: `<div class="article">${html}</div>` });
    }
});

// Sort articles in ascending order of date
articles.sort((a, b) => a.date.join('') - b.date.join(''));
// add the id of "latest" to the last div in the list
articles[articles.length - 1].content = articles[articles.length - 1].content.replace("<div class=\"article\">", "<div class=\"article\" id=\"latest\">");

// copy the folder src/site-skeleton to public
function copyDir(src, dest) {
    // delete the old public folder if it exists
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
    }
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(file => {
        let srcPath = path.join(src, file);
        let destPath = path.join(dest, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// copy the site skeleton to public
if (fs.existsSync('public')){
    fs.rmSync('public', { recursive: true });
}
fs.mkdirSync('public');
fs.copyFileSync('src/site-skeleton/index.html', 'public/index.html');
copyDir('img', 'public/img');

// Insert articles into index.html
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
let articlesHtml = articles.map(article => article.content).join('\n');
// remove newlines and extra spaces
// indexHtml = indexHtml.replace(/\n/g, '').replace(/ +/g, ' ');
// indexHtml = indexHtml.replace('<!-- placeholder -->', articlesHtml);
// instead save articlesHtml to a file
fs.writeFileSync('public/articles.html', articlesHtml);
indexHtml = indexHtml.replace('/*insert style*/', fs.readFileSync('src/site-skeleton/style.css', 'utf8'))
    // .replace(/\n/g, '').replace(/ +/g, ' ')
    ;
fs.writeFileSync('public/index.html', indexHtml);