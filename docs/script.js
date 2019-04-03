const draggingClassName = '-drag';
const fileReadArea = document.querySelector('.fileReader');

const urlInput = document.querySelector('.urlReader input');
const urlButton = document.querySelector('.urlReader button');

const resultArea = document.querySelector('.result');

fileReadArea.addEventListener('drop', onDrop, false);
fileReadArea.addEventListener('dragenter', onDragEnter, false);
fileReadArea.addEventListener('dragover', onDragOver, false);
fileReadArea.addEventListener('dragleave', onDragLeave, false);

urlButton.addEventListener('click', onClickUrlButton, false);

window.document.addEventListener('DOMContentLoaded', onLoadDocument, false);

async function onLoadDocument () {
  const params = new URLSearchParams(window.location.search);
  const json_url = params.get('url');
  if (!json_url) return false;
  const json = await fetchJSON(json_url);
  render(json);
}

async function fetchJSON (url) {
  const proxy_url = `https://jsonp.afeld.me?url=${url}`;
  const res = await fetch(proxy_url);
  const text = await res.text();
  return convertTextToJSON(text);
}

function convertTextToJSON (text) {
  const formatted_json_string = text.replace(/\]\[/g, ',');
  return JSON.parse(formatted_json_string);
}

async function onClickUrlButton (e) {
  const input_url = urlInput.value;
  const json = await fetchJSON(input_url);
  render(json);
}

function onDrop (e) {
  e.preventDefault();
  const files = e.dataTransfer.files;
  const file = files[0];
  const reader = new FileReader();
  reader.addEventListener('load', onFileRead, false);
  reader.readAsText(file, 'UTF-8');
}

function onFileRead(e) {
  const result = e.target.result;
  const json = convertTextToJSON(result);
  render(json);
}

function onDragEnter() {
  if (!fileReadArea.classList.contains(draggingClassName)) {
    fileReadArea.classList.add(draggingClassName);
  }
  return false;
}

function onDragOver(e) {
  e.preventDefault();
  return false;
}

function onDragLeave(e) {
  e.preventDefault();
  if (fileReadArea.classList.contains(draggingClassName)) {
    fileReadArea.classList.remove(draggingClassName);
  }
  return false;
}

function template (items) {
  const rows = items.map((item) => {
    const oldprice = parseInt(item.oldprice.replace('円','').replace(',',''));
    const newprice = parseInt(item.newprice.replace('円','').replace(',',''));
    const diff = (oldprice - newprice).toLocaleString();
    return `
    <tr>
      <th class="-name">
        <a href="${item.itemUrl}" target="_blank">
          ${item.name}
        </a>
      </th>
      <td class="-newprice">${item.newprice}</td>
      <td class="-oldprice">${item.oldprice}</td>
      <td class="-diff">${diff}円</td>
    </tr>
    `;
  }).join('');
  const table = `
    <table>
      <thead>
        <tr>
          <th class="-name">商品名</th>
          <th class="-newprice">新しい価格</th>
          <th class="-oldprice">古い価格</th>
          <th class="-diff">差額</th>
        </tr>
      </thead>
      <tbody>
        ${ rows }
      </tbody>
    </table>
  `;
  return table;
}

function render(data) {
  resultArea.innerHTML = template(data);
}