console.log('hello world', window.location.href);

fetch('./README.md')
  .then(res => res.text())
  .then(readme => console.log('// README.md\n', readme.slice(0, 200) + '...'));
