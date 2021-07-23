console.log('hello world!');

fetch('./README.md')
  .then(res => res.text())
  .then(readme => console.log('// README.md\n', readme.slice(0, 200) + '...'));

undefined.wtf;
